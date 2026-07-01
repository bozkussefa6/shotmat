import { CommonActions } from '@react-navigation/native';

export const resetGameFlowTo = (navigation, screen, params = {}) => {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: screen, params }],
    })
  );
};
