import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';

// toast
import { toast } from 'react-hot-toast';

// codemirror
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/darcula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';

// socket
import { initSocket } from '../socket';

// socket action events
import ACTIONS from '../Actions';

const Editor = ({ setClients, roomId }) => {
  const socket = useRef(null);
  const editorRef = useRef(null);
  const codeRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  // create text editor

  useEffect(() => {
    async function init() {
      const editorDOMHtmlElement = document.querySelector('.CodeMirror');

      if (!editorDOMHtmlElement) {
        editorRef.current = Codemirror.fromTextArea(
          document.getElementById('realtimeEditor'),
          {
            mode: { name: 'javascript', json: true },
            theme: 'darcula',
            autoCloseTags: true,
            autoCloseBrackets: true,
            lineNumbers: true
          }
        );

        editorRef.current.on('change', (instance, changes) => {
          const { origin } = changes;

          const code = instance.getValue();

          codeRef.current = code;

          if (origin !== 'setValue') {
            socket.current.emit(ACTIONS.CODE_CHANCE, { roomId, code });
          }
        });
      }
    }
    init();
  }, []);

  // socket initails

  useEffect(() => {
    const init = async () => {
      socket.current = await initSocket();

      socket.current.on('connection_error', (err) => handleError(err));
      socket.current.on('connection_failed', (err) => handleError(err));

      function handleError(e) {
        console.log('socket error', e);
        toast.error('Socket connection failed, try again later.');
        navigate('/');
      }

      socket.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username
      });

      // Listening for joined event

      socket.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location?.state.username) {
          toast.success(`${username} joined the room`);
        }

        setClients(clients);

        socket.current.emit(ACTIONS.SYNC_CODE, {
          roomId,
          code: codeRef.current
        });
      });

      socket.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) =>
          prev.filter((client) => client.socketId !== socketId)
        );
      });
    };

    init();

    return () => {
      socket.current.off(ACTIONS.JOINED);
      socket.current.off(ACTIONS.DISCONNECTED);
      socket.current.off(ACTIONS.SYNC_CODE);
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket.current) {
      socket.current.on(ACTIONS.CODE_CHANCE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      socket.current.off(ACTIONS.CODE_CHANCE);
    };
  }, [socket.current]);

  if (!location.state) return <Navigate to="/" />;

  return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;
