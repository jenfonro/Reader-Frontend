export const settingsItems = [
  {
    key: "settings-system",
    label: "系统设置",
    icon: "settings",
    description: "配置站点名称等基础信息"
  },
  {
    key: "settings-api",
    label: "接口设置",
    icon: "settings",
    description: "配置服务接口与连接参数"
  },
  {
    key: "settings-sources",
    label: "书源管理",
    icon: "library",
    description: "新建、导入、编辑或管理书源"
  },
  {
    key: "settings-replace",
    label: "替换净化",
    icon: "tag",
    description: "配置内容替换与净化规则"
  },
  {
    key: "settings-dictionary",
    label: "字典规则",
    icon: "complete",
    description: "配置字典规则与文本转换"
  },
  {
    key: "settings-interface",
    label: "界面设置",
    icon: "profile",
    description: "配置全屏模式等界面偏好"
  },
  {
    key: "settings-backup",
    label: "备份与恢复",
    icon: "bookshelf",
    description: "备份数据或从备份中恢复"
  }
];

export const findSettingsItem = key =>
  settingsItems.find(item => item.key === key) || null;
