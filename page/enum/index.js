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