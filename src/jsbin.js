

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>JS Bin</title>
</head>
<body>
<script src="https://fb.me/react-15.1.0.js"></script>
<script src="https://fb.me/react-dom-15.1.0.js"></script>
<script src="https://fb.me/react-with-addons-15.1.0.js"></script>
<script src="https://unpkg.com/styled-components/dist/styled-components.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-router/4.1.1/react-router.js" charset="utf-8"></script> 
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-router-dom/4.1.1/react-router-dom.js"></script>  

  <div id='app' />
</body>
</html>

const { BrowserRouter, Route, Link, Switch } = ReactRouterDOM;

const { keyframes } = styled;

const AnimationSlideInRight = keyframes`
from {transform: translateX(100%); opacity:0} 
to {transform: translateX(0); opacity:1}`
;

const AnimationSlideInLeft = keyframes`
  from {transform: translateX(-100%);}
  to {transform: translateX(0);}
`;

const AnimationZoomOutRight = keyframes`
  from {transform: translateX(0%)}
  to {transform: translateX(300%); transform: scale(0.1);}
`;

const AnimationSlideOutLeft = keyframes`
from {transform: translateX(0);opacity;1} 
to {transform: translateX(-100%); translateY:(-200px); opacity:1}`
;

console.log('div',styled.default.div)


function animatedPageKey(pathname) {
  //Don't want each new /topics/:topicId path to animate in
  if (pathname.slice(0, 7) == "/topics") return "/topics";
  return pathname;
}


class Home extends React.Component {
  render() {
  return (<div>
    <h2>Home</h2>
  </div>);
  }
}

class About extends React.Component {
  render() {
  return (<div>
    <h2>About</h2>
  </div>);
  }
}
    
class Topics extends React.Component {
          render() {
          const { match } = this.props;
    return (
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
  </div>);
  }
 }

class Topic extends React.Component {
  render() {
    const { match } = this.props;
    return (
    <div>
      <h3>{match.params.topicId}</h3>
    </div>
    );
  }
}

// Animations //

const AnimatedDiv = styled.default.div`
  position:absolute;
  top:0;
  left:0;
  right:0;
  bottom:0;
  animation-name: ${props => props.animationName};
  animation-duration: ${props => props.animationDuration};
  animation-fill-mode: both;`;

class Transitioner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prevChildKey: null,
      prevChild:null
    }
  }
  
  
  componentWillReceiveProps(nextProps) {
    if (this.props.childKey && this.props.childKey !== nextProps.childKey) {
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
  
  componentWillUnmount() {
  this.prevChildUnmountTimeout && clearTimeout(this.prevChildUnmountTimeout)
  }

  render() {
    const {
      childKey,
      children,
      getAnimationEnter,
      getAnimationLeave,
      animationEnter,
      animationLeave,
    } = this.props;

    const animationDurationMs = ".4s";

    const { prevChildKey, prevChild } = this.state;

    const aEnter = getAnimationEnter? getAnimationEnter(childKey) : AnimationSlideInRight;
    const aLeave = getAnimationLeave? getAnimationLeave(prevChildKey) : AnimationSlideOutLeft;
      
  
    //gets the single child or throws
    const child = React.Children.only(children);
    
    console.log('child=',child)

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


function animatedPageKey(pathname) {
  //Don't want each new /topics/:topicId path to <animate></animate> in
  if (pathname.slice(0, 7) == "/topics") return "/topics";
  return pathname;
}

function animationEnterForKey(key) {
  return key === "/topics" ? AnimationSlideInLeft : AnimationSlideInRight;
}

function animationLeaveForKey(key) {
  return key === "/" || key === "/home" ? AnimationZoomOutRight : AnimationSlideOutLeft;
}

class Pages extends React.Component {
  render() {
    const { location } = this.props;
    return (
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
  </Transitioner>)
}
}

console.log('pages=',Pages,'B=',BrowserRouter,' t=',Transitioner)

class BasicExample extends React.Component {  
  render() {
  return (
  <BrowserRouter>
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
  </BrowserRouter>
  );
  }
}

ReactDOM.render(<BasicExample />, document.getElementById('app'));


