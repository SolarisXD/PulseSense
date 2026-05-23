const Reanimated = {
  createAnimatedComponent: (Component: any) => Component,
  View: require('react-native').View,
  Text: require('react-native').Text,
  Image: require('react-native').Image,
  ScrollView: require('react-native').ScrollView,
  FlatList: require('react-native').FlatList,
  default: {
    createAnimatedComponent: (Component: any) => Component,
  },
};
export default Reanimated;
export const createAnimatedComponent = (Component: any) => Component;
