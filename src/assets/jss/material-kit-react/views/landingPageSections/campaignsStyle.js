import { title, primaryColor } from "assets/jss/material-kit-react.js";

const campaignsStyle = {

  color: "#999",

  section: {
    padding: "0",
    textAlign: "left"
  },
  title: {
    ...title,
    marginBottom: "1rem",
    marginTop: "30px",
    minHeight: "32px",
    textDecoration: "none",
    color: "#999"
  },
  description: {
    color: "#999",
    paddingBottom: "1em"
  },
  cardHeader: {
    width: "auto",
    border: "0",
    padding: "5px 2px",
    borderRadius: "3px",
    textAlign: "center",
    marginTop: "0px",
    marginLeft: "0px",
    marginRight: "0px",
    marginBottom: "15px",
    background: primaryColor,
    "flexContainer": {
      display: "flex",
      flexWrap: "space-around"
    }
  },

};

export default campaignsStyle;
