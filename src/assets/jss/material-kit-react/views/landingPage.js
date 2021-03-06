import { container, title } from "assets/jss/material-kit-react.js";

const landingPageStyle = {

  landingPage: {
    overflowX: "hidden"
  },
  container: {
    zIndex: "12",
    color: "#FFFFFF",
    ...container
  },
  dappLogo: {
    maxHeight: "2.5em"
  },
  titleContainer: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: "10px",
    padding: "1em"
  },
  title: {
    ...title,
    display: "inline-block",
    position: "relative",
    margin: "0 10%",
    minHeight: "32px",
    color: "#FFFFFF",
    textDecoration: "none",
    textAlign: "center",
    textShadow: "1px 1px 2px rgba(0, 0, 0, 1)",
    fontWeight: "600",
    width: "70%",
    margin: "0 15%"
 
  },
  subtitle: {
    textAlign: "center",
    textShadow: "1px 1px 2px rgba(0, 0, 0, 1)",
    fontWeight: "500",
    width: "70%",
    margin: "1rem 15%"
  },
  highlight: {
    textDecoration: "underline"
  },
  main: {
    background: "#FFFFFF",
    position: "relative",
    zIndex: "3"
  },
  mainRaised: {
    /*margin: "-60px 30px 0px",
    borderRadius: "6px",
    boxShadow:
      "0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2)"*/
  },
  topSeparator: {
    width: "100vw",
    marginTop: "-3.5em",
    marginLeft: "calc((100% - 100vw)/2)"
  },
  bottomSeparator: {
    width: "100vw",
    marginLeft: "calc((100% - 100vw)/2)"
  }
};

export default landingPageStyle;
