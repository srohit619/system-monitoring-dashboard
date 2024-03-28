PROMPT CREATE TABLE sys_dashboard_config
CREATE TABLE sys_dashboard_config (
  srno        NUMBER         NOT NULL,
  paramname   VARCHAR2(100)  NULL,
  paramvalue  VARCHAR2(400)  NULL,
  group_name  VARCHAR2(100)  NULL,
  deleted     VARCHAR2(10)   NULL,
  created_by  VARCHAR2(100)  NULL,
  created_on  DATE           DEFAULT SYSDATE NULL,
  description VARCHAR2(4000) NULL
)


INSERT INTO sys_dashboard_config (srno, paramname, paramvalue, group_name, deleted, created_by, created_on, description)
  VALUES(1, 'log_size_limit', '10', 'log-info', 'N', 'Rohit', To_Date('27.03.2024 00:38:19', 'dd.mm.yyyy hh24:mi:ss'), 'Size Limit of the logs in Megabytes format');
INSERT INTO sys_dashboard_config (srno, paramname, paramvalue, group_name, deleted, created_by, created_on, description)
  VALUES((SELECT Max(srno)+1 FROM sys_dashboard_config), 'nodeservicecenter', '..\nodeservicecenter\Logs', 'logFolderPath', 'N', 'SYSTEM', To_Date('06.03.2024 11:47:52', 'dd.mm.yyyy hh24:mi:ss'), NULL);

INSERT INTO sys_dashboard_config (srno, paramname, paramvalue, group_name, deleted, created_by, created_on, description)
  VALUES((SELECT Max(srno)+1 FROM sys_dashboard_config), 'idealetl', '..\idealetl\Logs', 'logFolderPath', 'N', 'SYSTEM', To_Date('06.03.2024 11:50:37', 'dd.mm.yyyy hh24:mi:ss'), NULL);
INSERT INTO sys_dashboard_config (srno, paramname, paramvalue, group_name, deleted, created_by, created_on, description)
  VALUES((SELECT Max(srno)+1 FROM sys_dashboard_config), 'idealworkercenter', '..\idealworkercenter\Logs', 'logFolderPath', 'N', 'SYSTEM', To_Date('06.03.2024 11:51:31', 'dd.mm.yyyy hh24:mi:ss'), NULL);
INSERT INTO sys_dashboard_config (srno, paramname, paramvalue, group_name, deleted, created_by, created_on, description)
  VALUES((SELECT Max(srno)+1 FROM sys_dashboard_config), 'jobcenter', '..\jobcenter\Logs', 'logFolderPath', 'N', 'SYSTEM', To_Date('06.03.2024 11:51:58', 'dd.mm.yyyy hh24:mi:ss'), NULL);
INSERT INTO sys_dashboard_config (srno, paramname, paramvalue, group_name, deleted, created_by, created_on, description)
  VALUES((SELECT Max(srno)+1 FROM sys_dashboard_config), 'jobcenternodered', '..\jobcenternodered\Logs', 'logFolderPath', 'N', 'SYSTEM', To_Date('06.03.2024 11:52:28', 'dd.mm.yyyy hh24:mi:ss'), NULL);
INSERT INTO sys_dashboard_config (srno, paramname, paramvalue, group_name, deleted, created_by, created_on, description)
  VALUES((SELECT Max(srno)+1 FROM sys_dashboard_config), 'ncenter_ideal', '..\ncenter_ideal\log', 'logFolderPath', 'N', 'SYSTEM', To_Date('06.03.2024 11:52:58', 'dd.mm.yyyy hh24:mi:ss'), NULL);
INSERT INTO sys_dashboard_config (srno, paramname, paramvalue, group_name, deleted, created_by, created_on, description)
  VALUES((SELECT Max(srno)+1 FROM sys_dashboard_config), 'nodeservicecenter', '..\nodeservicecenter\Logs', 'logFolderPath', 'N', 'SYSTEM', To_Date('06.03.2024 11:57:26', 'dd.mm.yyyy hh24:mi:ss'), NULL);



UPDATE sys_dashboard_config
SET paramvalue = 'nodeservicecenter\Logs'
WHERE paramname = 'nodeservicecenter'
AND group_name = 'logFolderPath'

DELETE sys_dashboard_config
WHERE paramname = 'nodeservicecenter'
AND group_name = 'logFolderPath'


SELECT * FROM V$SESSION


SELECT username, COUNT(*) AS active_sessions
FROM v$session
WHERE status = 'ACTIVE'
GROUP BY username;
