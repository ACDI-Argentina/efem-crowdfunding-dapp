import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Avatar from 'react-avatar';
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import { selectUserByAddress, fetchUserByAddress } from '../redux/reducers/usersSlice'

class ProfileCard extends Component {  //va a recibir como prop un address
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.fetchUserByAddress(this.props.address);
    }

    render() {
        const { user, namePosition } = this.props;
        const descriptionClass = namePosition === "left" || namePosition === "right" ? "" : "small";
        return (
            <div>
                <Link className={`profile-card ${namePosition}`} to={`/profile/${user.address}`}>
                    <Avatar size={50} src={user.avatar} round />
                    <p className={`description ${descriptionClass}`}>{user.name}</p>
                </Link>
            </div>
        );
    }
}

ProfileCard.propTypes = {
    address: PropTypes.string,
    namePosition: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
};

ProfileCard.defaultProps = {
    namePosition: 'bottom'
};

const mapStateToProps = (state, props) => {
    return {
        user: selectUserByAddress(state, props.address)
    }
}

const mapDispatchToProps = { fetchUserByAddress }

export default connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(ProfileCard)
);