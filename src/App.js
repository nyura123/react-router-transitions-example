import React, { Component } from "react";
import PropTypes from "prop-types";
import logo from "./logo.svg";
import "./App.css";

import styled, { keyframes } from "styled-components";

import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";

const AnimationSlideInRight = keyframes`
  from {transform: translateX(100%);}
  to {transform: translateX(0);}
`;

const AnimationSlideInLeft = keyframes`
  from {transform: translateX(-100%);}
  to {transform: translateX(0);}
`;

const AnimationSlideOutLeft = keyframes`
  from {transform: translateX(0);}
  to {transform: translateX(-100%);}
`;

const AnimationZoomOutRight = keyframes`
  from {transform: translateX(0%)}
  to {transform: translateX(300%); transform: scale(0.1);}
`;

const BasicExample = () =>
  <Router>
    <div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/topics">Topics</Link></li>
      </ul>

      <hr />

      <div style={{ height: 200 }}>
        <Route render={({ location }) => <Pages location={location} />} />
      </div>

    </div>
  </Router>;

function animatedPageKey(pathname) {
  //Don't want each new /topics/:topicId path to <animate></animate> in
  if (pathname.slice(0, 7) == "/topics") return "/topics";
  return pathname;
}

function animationEnterForKey(key) {
  return key === "/topics" ? AnimationSlideInLeft : AnimationSlideInRight;
}

function animationLeaveForKey(key) {
  return key === "/" ? AnimationZoomOutRight : AnimationSlideOutLeft;
}

const Pages = ({ location }) =>
  <Transitioner
    childKey={animatedPageKey(location.pathname)}
    getAnimationEnter={animationEnterForKey}
    getAnimationLeave={animationLeaveForKey}
    unmountPreviousTimeoutMs={450}
  >
    <Switch location={location}>
      <Route exact path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/topics" component={Topics} />
      <Route component={Home} />
    </Switch>
  </Transitioner>;

const Home = () =>
  <div>
    <h2>Home</h2>
  </div>;

const About = () =>
  <div>
    <h2>About</h2>
  </div>;

const Topics = ({ match }) =>
  <div>
    <h2>Topics</h2>
    <ul>
      <li>
        <Link to={`${match.url}/rendering`}>
          Rendering with React
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/components`}>
          Components
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/props-v-state`}>
          Props v. State
        </Link>
      </li>
    </ul>

    <Route path={`${match.url}/:topicId`} component={Topic} />
    <Route
      exact
      path={match.url}
      render={() => <h3>Please select a topic.</h3>}
    />
  </div>;

const Topic = ({ match }) =>
  <div>
    <h3>{match.params.topicId}</h3>
  </div>;

export default BasicExample;

// Animations //

const AnimatedDiv = styled.div`
 position:absolute;
 top:0;
 left:0;
 right:0;
 bottom:0;
 animation-name: ${props => props.animationName};
 animation-duration: ${props => props.animationDuration};
 animation-fill-mode: both;
 `;

// const AnimatedRoute = ({
//   path,
//   exact,
//   animationEnter = { AnimationSlideInRight },
//   animationLeave = { AnimationSlideOutLeft },
//   ...rest
// }) =>
//   <Route
//     path={path}
//     excat={exact}
//     children={({ match }) =>
//       <Transitioner
//         childKey={match ? match.path : "nomatch"}
//         animationEnter={animationEnter}
//         animationLeave={animationLeave}
//       >
//         <Route exact={exact} path={path} {...rest} />
//       </Transitioner>}
//   />;

class Transitioner extends Component {
  static propTypes = {
    childKey: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired, //require a single child
    getAnimationEnter: PropTypes.func,
    getAnimationLeave: PropTypes.func,
    animationEnter: PropTypes.element,
    animationLeave: PropTypes.element
  };

  state = {
    prevChildKey: null,
    prevChild: null
  };

  prevChildUnmountTimeout = null;

  componentWillReceiveProps(nextProps) {
    if (this.props.childKey && this.props.childKey !== nextProps.childKey) {
      console.log(
        "will transition from ",
        this.props.childKey,
        " to ",
        nextProps.childKey
      );

      //can't know when prev child animation is done, make it 2 seconds...
      const unmountAfterMs = this.props.unmountPreviousTimeoutMs || 2000;
      if (this.prevChildUnmountTimeout)
        clearTimeout(this.prevChildUnmountTimeout);
      this.setState(
        {
          prevChildKey: this.props.childKey,
          prevChild: React.Children.only(this.props.children)
        },
        () => {
          this.prevChildUnmountTimeout = setTimeout(
            () =>
              this.setState({
                prevChildKey: null,
                prevChild: null
              }),
            unmountAfterMs
          );
        }
      );
    }
  }

  render() {
    const {
      childKey,
      children,
      getAnimationEnter,
      getAnimationLeave,
      animationEnter,
      animationLeave,
      animationDurationMs = ".4s"
    } = this.props;

    const { prevChildKey, prevChild } = this.state;

    const aEnter =
      (getAnimationEnter && getAnimationEnter(childKey)) || animationEnter;
    const aLeave =
      (prevChildKey && getAnimationLeave && getAnimationLeave(prevChildKey)) ||
      animationLeave;
    //gets the single child or throws
    const child = React.Children.only(children);

    return (
      <div
        style={{
          height: "100%",
          position: "relative",
          backgroundColor: "grey"
        }}
      >

        {prevChildKey &&
          <AnimatedDiv
            key={prevChildKey}
            animationDuration={animationDurationMs}
            animationName={aLeave}
          >
            {prevChild}
          </AnimatedDiv>}

        <AnimatedDiv
          key={childKey}
          animationDuration={animationDurationMs}
          animationName={aEnter}
        >
          {child}
        </AnimatedDiv>

      </div>
    );
  }
}
