export interface TaskResponse {
  result: {
    aid: number;
    bvid: string;
    pubdate: number;
    title: string;
    description: string;
    tag: string;
    pic: string;
    type_id: number;
    user_id: number;
    priority: number;
  }[];
  time: number;
  status: "success" | string; // Assuming 'success' is the main success status
}

export interface BiliResponse {
  code: number;
  data: VideoInfo[];
  message: string;
}

export interface VideoInfo {
  attr: number;
  bv_id: string;
  bvid: string;
  cnt_info: CntInfo;
  coin: Coin;
  copyright: number;
  cover: string;
  ctime: number;
  dimension: Dimension;
  duration: number;
  elec_open: number;
  fav_state: number;
  id: number;
  intro: string;
  like_state: number;
  link: string;
  page: number;
  pages: Page[];
  pubtime: number;
  rights: Rights;
  short_link: string;
  tid: number;
  title: string;
  type: number;
  upper: Upper;
}

export interface CntInfo {
  coin: number;
  collect: number;
  danmaku: number;
  play: number;
  play_switch: number;
  reply: number;
  share: number;
  thumb_down: number;
  thumb_up: number;
  view_text_1: string;
  vt: number;
}

export interface Coin {
  coin_number: number;
  max_num: number;
}

export interface Dimension {
  height: number;
  rotate: number;
  width: number;
}

export interface Page {
  dimension: Dimension;
  duration: number;
  from: string;
  id: number;
  metas: Meta[];
  page: number;
  title: string;
}

export interface Meta {
  quality: number;
  size: number;
}

export interface Rights {
  autoplay: number;
  bp: number;
  download: number;
  elec: number;
  hd5: number;
  movie: number;
  no_background: number;
  no_reprint: number;
  pay: number;
  ugc_pay: number;
}

export interface Upper {
  face: string;
  followed: number;
  mid: number;
  name: string;
  vip_due_date: number;
  vip_pay_type: number;
  vip_statue: number;
  vip_type: number;
}

export interface BackendResponse {
  status: "success" | string;
  message: string;
  result?: any;
  details?: any;
}
