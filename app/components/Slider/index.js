import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  cursor: pointer;
  width: 100%;
  position: relative;
  min-height: 20px;
`;

const Track = styled.div`
  background-color: white;
  height: 2px;
  position: relative;
  top: 9px;
`;

const Position = styled.div`
  background-color: white;
  width: 3px;
  height: 100%;
  position: absolute;
`;

export default class Slider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
      draggingPosition: 0,
    };
    this.container = React.createRef();
  }

  setDragging = dragging => {
    this.setState({ dragging });
  };

  handleReposition = (event, force = false) => {
    if (!this.state.dragging && !force) {
      return;
    }
    const container = this.container.current;
    const positionInSlider = event.pageX - container.getBoundingClientRect().x;
    console.log(positionInSlider / container.offsetWidth);
    // debugger;
    this.setState({
      draggingPosition: positionInSlider / container.offsetWidth,
    });
  };

  handleStopDragging = () => {
    console.log("dragging stopped, " + this.state.draggingPosition + "%")
    this.setDragging(false);
    this.props.onFinishDragging(this.state.draggingPosition);
  };

  render() {
    let positionLeft = `${Math.floor(this.props.position * 100)}%`;
    if (this.state.dragging) {
      positionLeft = `${Math.floor(this.state.draggingPosition * 100)}%`;
    }

    return (
      <Container
        ref={this.container}
        onMouseMove={e => this.handleReposition(e)}
        onMouseDown={e => {
          // this.handleReposition(e);
          // console.log(e);
          this.handleReposition(e, true);
          this.setDragging(true);
        }}
        onMouseLeave={() => this.setDragging(false)}
        onMouseUp={this.handleStopDragging}
      >
        <Position style={{ left: positionLeft }} />
        <Track />
      </Container>
    );
  }
}

Slider.defaultProps = {
  position: 0,
  onFinishDragging: () => {},
};

Slider.propTypes = {
  position: PropTypes.number,
  onFinishDragging: PropTypes.func,
};
