import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const navigate = useNavigate();

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success('Created a new room');
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error('ROOM ID & username is required');
      return;
    }

    navigate(`/editor/${roomId}`, { state: { username: username } });
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
      joinRoom();
    }
  };

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img className="homePageLogo" src="/Logo.png" alt="logo" />
        <h4 className="mainLabel">Paste invitaion ROOM ID</h4>
        <div className="inputGroup">
          <input
            type="text"
            className="inputBox"
            placeholder="ROOM ID"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
            onKeyUp={handleInputEnter}
          />
          <input
            type="text"
            className="inputBox"
            placeholder="USERNAME"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyUp={handleInputEnter}
          />
          <button className="btn joinBtn" onClick={joinRoom}>
            Join
          </button>
          <span className="createInfo">
            If you don't have an invite then create &nbsp;
            <a href="#" onClick={createNewRoom} className="createNewBtn">
              new room
            </a>
          </span>
        </div>
      </div>
      <footer>
        <h4>Buit with 💖 by Coder's Harris</h4>
      </footer>
    </div>
  );
};

export default Home;
