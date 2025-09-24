import React from "react";
import PropTypes from "prop-types";

const TopStories = ({ children }) => {
    // Si no se le pasan hijos, no renderiza nada.
    if (!children || React.Children.count(children) === 0) {
        return null;
    }

    return (
        <div className="top-stories">
            {children}
        </div>
    );
};

TopStories.propTypes = {
    children: PropTypes.node,
};

export default TopStories;