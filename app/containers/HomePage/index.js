import React from 'react'

export default function HomePage() {
  const getTurd = () => {
    fetch('/get_file/aladin/master.m3u8', {
      credentials: 'include',
    }).then(
      () => {
        console.log('got file')
      }, 
      err => {
        console.error('error get file', e)
      }
    )
  }

  return (
    <div>
      <a href="/login">Login</a>
      <button onClick={getTurd}>getIT</button>
    </div>
  )
}