enum ParamsType {
  STRING = "STRING",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOLEAN",
  DATE_TIME = "DATE_TIME"
}

const ParamsTypeOptions = [
  {
    label: "字符串",
    value: ParamsType.STRING
  },
  {
    label: "数字",
    value: ParamsType.NUMBER
  },
  {
    label: "布尔",
    value: ParamsType.BOOLEAN
  },
  {
    label: "时间",
    value: ParamsType.DATE_TIME
  }
];

export { ParamsTypeOptions, ParamsType };
