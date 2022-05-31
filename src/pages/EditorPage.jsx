import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { toast } from 'react-hot-toast';

const EditorPage = () => {
  const [clients, setClients] = useState([]);
  const { roomId } = useParams();
  const navigate = useNavigate();

  async function copyRomeId() {
    await navigator.clipboard.writeText(roomId);
    toast.success(`Room ID has been copied to clipboard`);
  }

  function leaveRoom() {
    navigate('/');
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img src="/Logo.png" alt="" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRomeId}>
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className="editorWrap">
        <Editor setClients={setClients} roomId={roomId} />
      </div>
    </div>
  );
};

export default EditorPage;
