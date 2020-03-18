import React, { useEffect, useState } from 'react';

import { Container, Menu, Table } from 'semantic-ui-react';

export default function HomePage(props) {
  const [needToLogin, setNeedToLogin] = useState(false);
  const [videoList, setVideoList] = useState(null);
  const [chosenVideo, setChosenVideo] = useState(null);
  const [path, setPath] = useState('/');

  const listVideos = () => {
    setVideoList(null);
    fetch(`/list_videos${path}`, {
      credentials: 'include',
    })
      .then(
        r => {
          if (r.status === 401) {
            setNeedToLogin(true);
            return null;
          }
          return r.text();
        },
        err => {
          console.error('error get file', err);
        },
      )
      .then(r => {
        console.log(r);
        const videos = JSON.parse(r);
        videos.sort((a, b) => {
          if (a.type === 'dir' && b.type !== 'dir') {
            return -1;
          }
          if (a.type !== 'dir' && b.type === 'dir') {
            return 1;
          }
          return 0;
        });
        console.log(videos);
        setVideoList(videos);
      });
  };
  useEffect(() => {
    listVideos();
  }, [path]);

  const handleVideoClick = video => {
    if (video.type === 'dir') {
      setPath(
        path.endsWith('/')
          ? path + video.fileName
          : `${path}/${video.fileName}`,
      );
    }
  };

  return (
    <div>
      <Menu fixed="top">
        <Menu.Item header>Lockett Videos</Menu.Item>
      </Menu>
      <br />
      <br />
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell onClick={() => setPath('/')}>..</Table.Cell>
          </Table.Row>
          {(videoList || []).map(video => (
            <Table.Row>
              <Table.Cell onClick={() => handleVideoClick(video)}>{video.fileName}</Table.Cell>
              <Table.Cell>{video.type}</Table.Cell>
              <Table.Cell>{video.fileType}</Table.Cell>
              <Table.Cell>{video.size}</Table.Cell>
              <Table.Cell>{video.synced ? 'synced' : 'not synced'}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <br />
      <br />
    </div>
  );
}
