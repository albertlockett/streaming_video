import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';

const VideoListChoice = styled.div`
  cursor: pointer;
  color: darkblue;
  text-decoration: underline;
  
  display: grid
  grid-template-columns: auto auto;
  &:hover {
    color: blue;
  }
`;

const VideoListContainer = styled.div`
  padding: 12px;
  font-size: 18px;
`;

function VideoLink({ video, setChosenVideo, path, setPath }) {
  const filename =
    video.type === 'dir' ? `/${video.fileName}` : `${video.fileName}`;
  return (
    <VideoListChoice
      key={video}
      onClick={() => {
        if (video.type === 'dir') {
          setPath(
            path.endsWith('/')
              ? path + video.fileName
              : `${path}/${video.fileName}`,
          );
        } else {
          setChosenVideo(video);
        }
      }}
    >
      <span>{filename}</span>
      <span>{video.synced ? ' synced' : ' not synced'}</span>
    </VideoListChoice>
  );
}

export default function VideoWindowContents(props) {
  const [videoList, setVideoList] = useState(null);
  const [path, setPath] = useState('/');

  const listVideos = () => {
    setVideoList(null)
    fetch(`/list_videos${path}`, {
      credentials: 'include',
    })
      .then(
        r => {
          if (r.status === 401) {
            // setNeedToLogin(true);
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

  const handleVideoClick = () => {
    props.createWindow('video - alladin', { video: 'aladdin' });
  }

  return (
    <Fragment>
      <VideoListContainer>
        <div>{videoList === null && <div>Loading</div>}</div>
        <div>
          {videoList !== null && (
            <Fragment>
              {path !== '/' && (
                <Fragment>
                  <VideoListChoice onClick={() => setPath('/')}>
                    ..
                  </VideoListChoice>
                  <br />
                </Fragment>
              )}
              {videoList.map(video => (
                // eslint-disable-next-line
                <Fragment>
                  <VideoLink
                    video={video}
                    setChosenVideo={handleVideoClick}
                    path={path}
                    setPath={setPath}
                  />
                  <br />
                </Fragment>
              ))}
            </Fragment>
          )}
        </div>
      </VideoListContainer>
    </Fragment>
  );
}