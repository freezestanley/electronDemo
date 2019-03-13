// 页面操作行为行分隔符，每行表示一个完整的动作
export const SPLIT_LINE    = "Ø";
// 页面操作数据分隔符，每个数据包含动作，节点，或内容
export const SPLIT_DATA    = "Ã";
// PC端
export const AGENT_PC      = "p";
// APP或H5
export const AGENT_MOBILE  = "m";
// 鼠标移动事件
export const ACTION_HOVER  = "h";
// 点击事件
export const ACTION_CLICK  = "c";
// 输入事件
export const ACTION_INPUT  = "i";
// 当前页跳转URL
export const ACTION_URL    = "u";
// 当点击的元素是<a>标签且target='_blank'，动作由c改成tab
export const ACTION_TAB    = "tab";
// 切换页签
export const ACTION_SWITCH = "sw";
// 设置cookie
export const ACTION_COOKIE = "sc";
// 滚动
export const ACTION_SCROLL = "scr";
// select
export const ACTION_SELECT = "s";
// 打开页面
export const ACTION_OPEN  = "o";
// 窗口大小
export const WINDOW_SIZE  = "ws";
// 拖拽
// drag 事件 
// 1546848451334ÃdragÃS:281.6328125-499.4609375ÃE:270.28515625-601.01171875ÃØ
// 时间 Ã 事件 Ã S(拖拽开始的点):拖拽开始点在屏幕X坐标 -(分割) 拖拽开始点在屏幕Y坐标 E(拖拽结束点)：拖拽结束点在屏幕X坐标 -(分割) 拖拽结束点在屏幕Y坐标
// ps 只记录开始和结束点，表示直线拖拽
export const ACTION_DRAG  = "drag"

export const PAINT_START = "paintstart"

export const PAINT_MOVE = "paintmove"

export const PAINT_END = "paintend"

export const POP_STATE = "pt"

export const HASH_CHANGE = "hc"

export const INPUT_FOCUS = 'ic'

export const INPUT_BLUR = 'ib'