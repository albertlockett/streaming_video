import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import VideoPlayer from 'components/VideoPlayer';

const VideoListChoice = styled.div`
  cursor: pointer;
  color: darkblue;
  text-decoration: underline;
  display: inline-block;
  &:hover {
    color: blue;
  }
`;

const VideoListContainer = styled.div`
  padding-top: 12px;
  padding-left: 65px;
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
      {filename}
    </VideoListChoice>
  );
}

export default function HomePage() {
  const [needToLogin, setNeedToLogin] = useState(false);
  const [videoList, setVideoList] = useState(null);
  const [chosenVideo, setChosenVideo] = useState(null);
  const [path, setPath] = useState('/');

  const listVideos = () => {
    setVideoList(null)
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

  return (
    <Fragment>
      <VideoListContainer>
        <div>
          {needToLogin && <a href="/login">You need to Login or Register</a>}
        </div>
        <div>{!needToLogin && videoList === null && <div>Loading</div>}</div>
        <div>
          {videoList !== null && chosenVideo === null && (
            <Fragment>
              <div>Choose video</div>
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
                    setChosenVideo={setChosenVideo}
                    path={path}
                    setPath={setPath}
                  />
                  <br />
                </Fragment>
              ))}
            </Fragment>
          )}
        </div>
        <div>
          {chosenVideo != null && (
            // eslint-disable-next-line
            <div onClick={() => setChosenVideo(null)}>
              <VideoListChoice>Back</VideoListChoice>
              <br />
              <br />
            </div>
          )}
        </div>
      </VideoListContainer>
      <div>{chosenVideo != null && <VideoPlayer video={chosenVideo} />}</div>
    </Fragment>
  );
}
