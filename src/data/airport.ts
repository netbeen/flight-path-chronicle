export interface Airport {
  /** 机场中文名字 */
  name: string;
  /** 机场三位英文缩写 */
  code: string;
  /** 机场物理坐标 */
  latitude: number;
  /** 机场物理坐标 */
  longitude: number;
}

/** 预定义的机场数据 */
export const AIRPORTS: Airport[] = [
  {
    name: '北京首都国际机场',
    code: 'PEK',
    latitude: 40.0724,
    longitude: 116.5971,
  },
  {
    name: '上海浦东国际机场',
    code: 'PVG',
    latitude: 31.1559,
    longitude: 121.8053,
  },
  {
    name: '上海虹桥国际机场',
    code: 'SHA',
    latitude: 31.1959,
    longitude: 121.3417,
  },
  {
    name: '广州白云国际机场',
    code: 'CAN',
    latitude: 23.3896,
    longitude: 113.3057,
  },
  {
    name: '成都双流国际机场',
    code: 'CTU',
    latitude: 30.5785,
    longitude: 103.9471,
  },
  {
    name: '西安咸阳国际机场',
    code: 'XIY',
    latitude: 34.4388,
    longitude: 108.7583,
  },
];

/** 根据机场代码查找机场信息 */
export const getAirportByCode = (code: string): Airport | undefined => {
  return AIRPORTS.find(airport => airport.code === code);
};