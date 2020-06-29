import React from 'react';
import {View} from 'react-native';
import {G, Circle} from 'react-native-svg';

class Tooltip extends React.Component {
  setNativeProps = props => {
    if (props.index) {
      this.index = props.index;
    }
    this._component && this._component.setNativeProps(props);
    console.log(this.index);
  };

  // constructor(props) {
  //   super(props);
  //   console.log(this.props.index);
  // }

  render() {
    return (
      <G
        ref={component => (this._component = component)}
        x={this.props.x(this.props.index) - 75 / 2}
        key={'tooltip'}
        onPress={() => console.log('tooltip clicked')}>
        <G x={75 / 2}>
          <Circle
            cy={this.props.y(this.props.data[this.props.index])}
            r={8}
            stroke={'#1976d2'}
            strokeWidth={2.5}
            fill={'white'}
          />
        </G>
      </G>
    );
  }
}

export default Tooltip;
