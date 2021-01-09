import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";

// core components
import Header from "components/Header/Header.js";
import Footer from "components/Footer/Footer.js";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Parallax from "components/Parallax/Parallax.js";

// Sections for this page
import Campaigns from "components/views/Campaigns.jsx";
import JoinGivethCommunity from 'components/JoinGivethCommunity.jsx';
import MainMenu from "components/MainMenu.jsx";

import styles from "assets/jss/material-kit-react/views/landingPage.js";
import { withTranslation } from 'react-i18next';

import OnlyRole from 'components/OnlyRole';

import { CREATE_CAMPAIGN_ROLE } from "constants/Role";

import Button from "components/CustomButtons/Button.js";
import OnlyCorrectNetwork from 'components/OnlyCorrectNetwork';

const useStyles = makeStyles(styles);

export default withTranslation()(function LandingPage(props) {
  const classes = useStyles();
  const { t,...rest } = props;
  
  return (
    <div>
      <Header
        color="white"
        brand="Give4Forest"
        rightLinks={<MainMenu />}
        {...rest}
      />
      <Parallax image={require("assets/img/landing-bg.jpg")}>
      <div className={classes.container}>
          <GridContainer justify="center">
            <GridItem xs={12} sm={12} md={8}>
              <div className={classes.titleContainer}>
                <h2 className={classes.title}>{t('landingPageTitle')}</h2>
                <h4 className={classes.subtitle}>
                  {t('landingPagesSubtitle1')}<span className={classes.highlight}>{t('landingPagesSubtitle2')}</span>{t('landingPagesSubtitle3')}<span className={classes.highlight}>{t('landingPagesSubtitle4')}</span>{t('landingPagesSubtitle5')}
                </h4>
                {/*<center>
                  <OnlyCorrectNetwork>
                    <OnlyRole role={CREATE_CAMPAIGN_ROLE}>
                      <Button style={{ marginRight: "2em" }} color="primary" size="m" className="btn btn-info" onClick={() => this.createCampaign()}>
                      {t('landingPageFinanceProject')}
                      </Button>
                    </OnlyRole>
                    <Button color="primary" size="m" className="btn btn-info" onClick={() => {}}>
                      {t('landingPageMakeDonation')}
                    </Button>
                  </OnlyCorrectNetwork>            
                </center>*/}
              </div>
            </GridItem>
          </GridContainer>
        </div>
      </Parallax>
      <div className={classNames(classes.main, classes.mainRaised)}>
        <div className={classes.container}>
          <JoinGivethCommunity history={props.history} />
          {/*<DACs />*/}
          <Campaigns />
        </div>
      </div>
      <Footer />
    </div>
  );
});
