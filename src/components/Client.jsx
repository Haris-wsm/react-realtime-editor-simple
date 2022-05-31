import React from 'react';
import Avatar from 'react-avatar';

const Client = ({ username }) => {
  return (
    <div className="client">
      <Avatar name={username} size="40" round="10px" textSizeRatio={3} />
      <span className="userName">{username}</span>
    </div>
  );
};

export default Client;
