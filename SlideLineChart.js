/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {
  ClipPath,
  Defs,
  Rect,
  LinearGradient,
  Stop,
  Line,
} from 'react-native-svg';
import {LineChart, Path, Grid, YAxis} from 'react-native-svg-charts';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import Animated, {cond, or, call, eq} from 'react-native-reanimated';
import * as shape from 'd3-shape';
import Tooltip from './Tooltip';
const chartHeight = 200;
const screenWidth = Dimensions.get('screen').width;

const AnimatedTooltip = Animated.createAnimatedComponent(Tooltip);

const Clips = ({x, width, indexToClipFrom}) => (
  <Defs key={'clips'}>
    <ClipPath id="clip-path-1">
      <Rect x={'0'} y={'0'} width={x(indexToClipFrom)} height={'100%'} />
    </ClipPath>
    <ClipPath id={'clip-path-2'}>
      <Rect
        x={x(indexToClipFrom)}
        y={'0'}
        width={width - x(indexToClipFrom)}
        height={'100%'}
      />
    </ClipPath>
  </Defs>
);

// Line extras:
const DashedLine = ({line}) => (
  <Path
    key={'line-1'}
    d={line}
    stroke={'#e57373'}
    strokeWidth={3}
    fill={'none'}
    // strokeDasharray={[4, 4]}
    clipPath={'url(#clip-path-2)'}
  />
);

const Shadow = ({line, width, height}) => {
  return (
    <>
      <Defs>
        <LinearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="gradient">
          <Stop stopColor="#CDE3F8" offset="0%" />
          <Stop stopColor="#eef6fd" offset="80%" />
          <Stop stopColor="#FEFFFF" offset="100%" />
        </LinearGradient>
      </Defs>
      <Path
        d={`${line} L ${width} ${height} L 0 ${height}`}
        fill="url(#gradient)"
      />
    </>
  );
};

const VerticalLine = ({x, index}) => (
  <Line
    key={'zero-axis'}
    x1={x(index)}
    x2={x(index)}
    y1={'10%'}
    y2={'100%'}
    stroke={'grey'}
    strokeDasharray={[4, 8]}
    strokeWidth={2}
  />
);

class SlideLineChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cursorIndex: 0,
    };
    this.contentInset = {
      top: 20,
      bottom: 20,
    };
    this.data = this.props.data;
    this.addX = 0;
    this.numData = this.data.length;
    this.indexToClipFrom = this.props.indexToClipFrom;
    this.absoluteX = new Animated.Value(0);
    this.translationX = new Animated.Value(0);
    this.velocityX = new Animated.Value(0);
    this.gestureState = new Animated.Value(-1);
    this.onGestureEvent = Animated.event(
      [
        {
          nativeEvent: {
            velocityX: this.velocityX,
            absoluteX: this.absoluteX,
            state: this.gestureState,
          },
        },
      ],
      {useNativeDriver: true},
    );
  }

  move = ([absoluteX, velocityX]) => {
    const newIndex = Math.floor(absoluteX / (screenWidth / this.numData));
    if (Math.abs(velocityX) > 150) {
      if (
        newIndex !== this.state.cursorIndex &&
        newIndex > -1 &&
        newIndex < this.numData
      ) {
        this.setState({
          cursorIndex: newIndex,
        });
      }
    }
  };

  render() {
    return (
      <View style={styles.root}>
        <Text
          style={{
            fontWeight: 'bold',
            marginLeft: 30,
            fontSize: 20,
          }}>
          y: ${this.data[this.state.cursorIndex].y} {'\n'}
          x: {this.data[this.state.cursorIndex].x}
        </Text>
        <Animated.Code>
          {() =>
            cond(
              or(
                eq(this.gestureState, State.BEGAN),
                eq(this.gestureState, State.ACTIVE),
              ),
              call([this.absoluteX, this.velocityX], this.move),
            )
          }
        </Animated.Code>
        <PanGestureHandler
          maxPointers={1}
          onGestureEvent={this.onGestureEvent}
          onHandlerStateChange={this.onGestureEvent}>
          <Animated.View style={[styles.chartContainer]}>
            <YAxis
              style={{marginRight: 10}}
              data={this.data.map(item => item.y)}
              contentInset={this.contentInset}
              svg={{
                fill: 'grey',
                fontSize: 10,
              }}
              numberOfTicks={10}
              formatLabel={value => `$${value}`}
            />
            <LineChart
              style={{flex: 1}}
              data={this.data.map(item => item.y)}
              contentInset={this.contentInset}
              svg={{
                stroke: '#1976d2',
                strokeWidth: 4,
                clipPath: 'url(#clip-path-1)',
              }}>
              <Clips indexToClipFrom={this.indexToClipFrom} />
              <Shadow />
              <DashedLine />
              <Grid
                svg={{
                  stroke: 'rgb(211,211,211)',
                }}
              />
              <VerticalLine index={Math.floor(this.state.cursorIndex)} />
              <AnimatedTooltip index={Math.floor(this.state.cursorIndex)} />
            </LineChart>
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  chartContainer: {
    height: chartHeight,
    flexDirection: 'row',
    paddingHorizontal: 30,
  },
});

export default SlideLineChart;
