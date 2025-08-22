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
    name: '北京首都',
    code: 'PEK',
    latitude: 40.0724,
    longitude: 116.5971,
  },
  {
    name: '上海浦东',
    code: 'PVG',
    latitude: 31.1559,
    longitude: 121.8053,
  },
  {
    name: '上海虹桥',
    code: 'SHA',
    latitude: 31.1959,
    longitude: 121.3417,
  },
  {
    name: '广州白云',
    code: 'CAN',
    latitude: 23.3896,
    longitude: 113.3057,
  },
  {
    name: '北京大兴',
    code: 'PKX',
    latitude: 39.509945,
    longitude: 116.41092,
  },
  {
    name: '杭州萧山',
    code: 'HGH',
    latitude: 30.234345,
    longitude: 120.437058,
  },
  {
    name: '新加坡樟宜',
    code: 'SIN',
    latitude: 1.3644,
    longitude: 103.9915,
  },
  {
    name: '香港赤鱲角',
    code: 'HKG',
    latitude: 22.3080,
    longitude: 113.9185,
  },
  {
    name: '西雅图塔科马',
    code: 'SEA',
    latitude: 47.4502,
    longitude: -122.3088,
  },
  {
    name: '厦门高崎',
    code: 'XMN',
    latitude: 24.5443,
    longitude: 118.128,
  },
  {
    name: '普吉岛',
    code: 'HKT',
    latitude: 8.113,
    longitude: 98.317,
  },
];

/** 根据机场代码查找机场信息 */
export const getAirportByCode = (code: string): Airport | undefined => {
  return AIRPORTS.find(airport => airport.code === code);
};