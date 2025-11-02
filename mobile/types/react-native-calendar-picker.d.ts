declare module "react-native-calendar-picker" {
  import { Component } from "react";
  import { ViewStyle, TextStyle } from "react-native";

  interface CalendarPickerProps {
    onDateChange?: (date: Date) => void;
    selectedStartDate?: Date;
    todayBackgroundColor?: string;
    selectedDayColor?: string;
    selectedDayTextColor?: string;
    width?: number;
    height?: number;
    textStyle?: TextStyle;
    style?: ViewStyle;
  }

  export default class CalendarPicker extends Component<CalendarPickerProps> {}
}
