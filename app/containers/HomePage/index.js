import React, { Fragment, useState } from 'react';
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

export default function HomePage() {
  const [needToLogin, setNeedToLogin] = useState(false);
  const [videoList, setVideoList] = useState(null);
  const [chosenVideo, setChosenVideo] = useState(null);

  const listVideos = () => {
    fetch('/list_videos', {
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
        if (r != null) {
          setVideoList(r.split('\n'));
        }
      });
  };

  if (videoList === null) {
    listVideos();
  }

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
              {videoList.map(video => (
                // eslint-disable-next-line
                <Fragment>
                  <VideoListChoice
                    key={video}
                    onClick={() => {
                      setChosenVideo(video);
                    }}
                  >
                    {video}
                  </VideoListChoice>
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
