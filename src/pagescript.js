module.exports = {
    load: async function ({ filters, userobj }) {
        let context = {};
        try {
            const processInfo = require('process');
const os = require("os");
const path = require("path");
const fs = require("fs");
const { exec, execSync } = require('child_process');
const oracledb = require("oracledb");
const axios = require('axios');
logger.error("Oracle client library version is " + oracledb.oracleClientVersionString);
const MongoClient = require('mongodb').MongoClient;
const amqp = require('amqplib');
// const config = require('./config')

// logger.error('rs-----------config',config)



// Replace with your actual MongoDB connection URI

const uri = "mongodb://localhost:27017/"; 
const client = new MongoClient(uri);

async function getMongoVersion() {
  try {
    await client.connect();
    const db = client.db('local');  // Or specify your database name if different
    const versionInfo = await db.command({ buildInfo: 1 });
    return versionInfo.version;
  } catch (error) {
    console.error("Error getting MongoDB version:", error);
  } finally {
    client.close();
  }
}


getMongoVersion()
    .then(version => {
        console.log("MongoDB version:", version); 
        context.getMongoVersion = version
    })
    .catch(error => {
        console.error('Failed to get MongoDB version:', error.message);
    });



async function getRabbitMQVersion() {
    try {
        const response = await axios.get('http://127.0.0.1:15672/api/overview', {
            auth: {
                username: 'credence',
                password: 'credence'
            }
        });

        const rabbitmq_version = response.data.rabbitmq_version;
        const erlang_version = response.data.erlang_version;

        console.log('RabbitMQ Server Version:', rabbitmq_version);
        console.log('Erlang Server Version:', erlang_version);
        return response.data;
    } catch (error) {
        console.error('Error fetching RabbitMQ version:', error.message);
        throw error;
    }
}

// Usage
getRabbitMQVersion()
    .then(version => {
        console.log('RabbitMQ Version:', version.rabbitmq_version);
        context.rabbitmqversion = version.rabbitmq_version
        context.erlangversion = version.erlang_version
    })
    .catch(error => {
        console.error('Failed to get RabbitMQ version:', error.message);
    });


/*----------------------------------------- Database Informations -------------------------------------------*/

// const dbDetails = await page3.db.find({
//     table: `(SELECT
//   (SELECT COUNT(table_name) FROM all_tables WHERE owner = (SELECT SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') FROM dual)) AS COUNT,
//   (SELECT version FROM v$timezone_file) AS version,
//   (SELECT BANNER FROM v$version WHERE banner LIKE 'Oracle%') AS BANNER,
//   (SELECT SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') from dual) AS SCHEMA_NAME,
//   (SELECT TO_CHAR(value / POWER(2, 30), '999.99') FROM V$OSSTAT WHERE  stat_name IN ('FREE_MEMORY_BYTES')) AS FreeRAM,
//   (SELECT TO_CHAR(value / POWER(2, 30), '999.99') FROM V$OSSTAT WHERE  stat_name IN ('PHYSICAL_MEMORY_BYTES')) AS TotalRAM,
//   (SELECT COUNT(*) FROM DBA_USERS) AS TOTAL_USERS,
//   (SELECT LTrim(TO_CHAR(TO_NUMBER(VALUE/100) * 100, '999.99')) || ' %' FROM V$SYSMETRIC WHERE METRIC_NAME = 'CPU Usage Per Sec') AS Value,
//   (SELECT TO_CHAR(STARTUP_TIME, 'DD-MON-YYYY HH:MI AM')  FROM V$INSTANCE) AS DATABASE_STARTUP_TIME,
//   (SELECT TO_CHAR(SUM(bytes) / POWER(2, 30), '999.99') || ' GB' FROM dba_segments) AS TOTAL_SIZE_MB 
// FROM dual)`,
//     filters: filters,
// });

const dbDetails = await page3.db.find({
  table: `(SELECT
  (SELECT COUNT(table_name) FROM all_tables WHERE owner = (SELECT SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') FROM dual)) AS COUNT,
  (SELECT version FROM v$timezone_file) AS version,
  (SELECT BANNER FROM v$version WHERE banner LIKE 'Oracle%') AS BANNER,
  (SELECT SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') from dual) AS SCHEMA_NAME,
  (SELECT TO_CHAR(value / POWER(2, 30), '999.99') FROM V$OSSTAT WHERE  stat_name IN ('FREE_MEMORY_BYTES')) AS FreeRAM,
  (SELECT TO_CHAR(value / POWER(2, 30), '999.99') FROM V$OSSTAT WHERE  stat_name IN ('PHYSICAL_MEMORY_BYTES')) AS TotalRAM,
  (SELECT COUNT(*) FROM DBA_USERS) AS TOTAL_USERS,
  (SELECT LTrim(TO_CHAR(TO_NUMBER(VALUE/100) * 100, '999.99')) || ' %' FROM V$SYSMETRIC WHERE METRIC_NAME = 'CPU Usage Per Sec') AS Value,
  (SELECT TO_CHAR(STARTUP_TIME, 'DD-MON-YYYY HH:MI AM')  FROM V$INSTANCE) AS DATABASE_STARTUP_TIME,
  (SELECT TO_CHAR(SUM(bytes) / POWER(2, 30), '999.99') || ' GB' FROM dba_segments) AS TOTAL_SIZE_MB,
  (SELECT Count(loginid) tot_users FROM userlist WHERE active = 'T' AND cl_locked = 'N') AS ACT_USER,
  (SELECT Count(loginid) act_users FROM userlist) AS TOT_USERS,
  (SELECT Count(loginid) tot_con_users FROM userlist WHERE connected = 'Y' AND active = 'T' AND cl_locked = 'N') AS TOT_CON_USERS,
  (SELECT Count(loginid) tot_inac_users FROM  userlist WHERE connected = 'N' AND active = 'T' AND cl_locked = 'N') AS TOT_INAC_USERS,
  (SELECT Count(loginid) tot_del_users FROM  userlist WHERE connected = 'N' AND active = 'F' AND cl_locked in ('Y','N')) AS TOT_DEL_USERS,
  (SELECT patch_no curr_patch_no FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) curr_patch_no,
  (SELECT prev_patch_no FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) prev_patch_no,
  (SELECT release_date FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) release_date,
  (SELECT applied_on FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) APPLIED_ON ,
  (SELECT paramvalue FROM sys_dashboard_config  WHERE paramname = 'log_size_limit') LOG_SIZE_LIMIT
FROM dual)`,
  filters: filters,
});

context.dbDetails = dbDetails;
context.db_BANNER = dbDetails[0].BANNER
context.db_FREERAM = dbDetails[0].FREERAM
context.db_TOTAL_TABLES = dbDetails[0].COUNT
context.db_tz_VERSION = dbDetails[0].VERSION
context.db_SCHEMA_NAME = dbDetails[0].SCHEMA_NAME
context.db_TOTALRAM = dbDetails[0].TOTALRAM
context.db_CPU_USAGE = dbDetails[0].VALUE
context.db_TOTAL_SIZE_MB = dbDetails[0].TOTAL_SIZE_MB
context.db_DATABASE_STARTUP_TIME = dbDetails[0].DATABASE_STARTUP_TIME
context.db_TOTAL_USERS = dbDetails[0].TOTAL_USERS
context.db_APPLIED_ON = dbDetails[0].APPLIED_ON || 'N/A'

/*
LOG_SIZE_LIMIT = determine the limit of log size 
*/
let LOG_SIZE_LIMIT = dbDetails[0].LOG_SIZE_LIMIT;

var resultForRam = calculateAvailability(context.db_FREERAM, context.db_TOTALRAM);
context.dbRamPerc = resultForRam.percentageUsed;
context.dbRamStatus = resultForRam.status
context.dbRamused = resultForRam.used
context.oracleClientVersion = oracledb.oracleClientVersionString

/*
For Usermaster Section
*/
context.db_TOT_USERS = dbDetails[0].TOT_USERS
context.db_TOT_CON_USERS = dbDetails[0].TOT_CON_USERS
context.db_TOT_INAC_USERS = dbDetails[0].TOT_INAC_USERS
context.db_TOT_DEL_USERS = dbDetails[0].TOT_DEL_USERS
context.db_ACT_USER = dbDetails[0].ACT_USER
// console.log('db_TOTAL_TABLES', dbDetails[0].COUNT);


function calculateAvailability(free, total) {
    // Calculate used value
    const used = total - free;

    // Calculate percentage used
    const percentageUsed = (used / total) * 100;

    // Determine status based on percentage used
    let status;
    let badgeStatus;
    if (percentageUsed <= 40) {
        status = "success";
        badgeStatus = 'Stable'
    } else if (percentageUsed >= 41 && percentageUsed < 60) {
        status = "warning";
        badgeStatus = 'Average'
    } else {
        status = "danger";
        badgeStatus = 'High'
    }

    return {
        free: free,
        used: used.toFixed(2) + ' GB',
        percentageUsed: percentageUsed.toFixed(2),
        status: status,
        badgeStatus: badgeStatus
    };
}




/*------------------------------------------- System Information --------------------------------------------*/



let connectionstatus = "Disconnected";
let IPV4;
let type;
let networkBadge;





const networkInterfaces = os.networkInterfaces();
console.log('D1')
if (networkInterfaces) {
  if (networkInterfaces['Wi-Fi 5']) {
    const wifiInterfaces = networkInterfaces['Wi-Fi 5'].filter(interface => interface.family === 'IPv4');
    if (wifiInterfaces.length > 0) {
      const wifiInterface = wifiInterfaces[0];
      connectionStatus = "Connected";
      networkBadge = 'success';
      IPV4 = wifiInterface.address;
      type = "WiFi";
    }
  } else if (networkInterfaces['WiFi']) { // Check for 'WiFi' interface
    const wifiInterfaces = networkInterfaces['WiFi'].filter(interface => interface.family === 'IPv4');
    if (wifiInterfaces.length > 0) {
      const wifiInterface = wifiInterfaces[0];
      connectionStatus = "Connected";
      networkBadge = 'success';
      IPV4 = wifiInterface.address;
      type = "WiFi";
    }
  } else if (networkInterfaces['Ethernet']) {
    const ethernetInterfaces = networkInterfaces['Ethernet'].filter(interface => interface.family === 'IPv4');
    if (ethernetInterfaces.length > 0) {
      const ethernetInterface = ethernetInterfaces[0];
      connectionStatus = "Connected";
      networkBadge = 'success';
      IPV4 = ethernetInterface.address;
      type = "Ethernet";
    }
  } else {
    connectionStatus = "Disconnected";
    networkBadge = 'danger';
    IPV4 = 'Null';
    type = 'N/A';
  }
}
console.log('IPV4', IPV4 || 'not found')
console.log('Connection Status:', connectionStatus);

////////////////////////////////////

const uptimeInSeconds = os.uptime();
// const uptimeInDays = (uptimeInSeconds / (60 * 60 * 24)).toFixed(2);
const days = Math.floor(uptimeInSeconds / (60 * 60 * 24));
const hours = Math.floor((uptimeInSeconds % (60 * 60 * 24)) / (60 * 60));

const data = os.type();

function sysdetails() {
    const uptimeInSeconds = os.uptime();
    // console.log("rs---->", uptimeInSeconds);
    return uptimeInSeconds;
}
// console.log("rs---->", data);
const details = sysdetails();
const info = {
    ram: {
        total: [(os.totalmem() / 1e9).toFixed(1)],
        free: [(os.freemem() / 1e9).toFixed(1)],
    },
    // storage: await diskusage.check('/'),
    processList: [],
    network: os.networkInterfaces(),
    networkstatus: connectionStatus,
    systemDetails: {
        hostname: os.hostname(),

        uptime: `${days} days ${hours} hours`,
        platform: os.platform(),
        type: os.type(),
        arch: os.arch(),
        release: os.release(),
        cpu_core: os.cpus().length,
    },
    cpuUsage: 0,
};

// console.log("rs---->", info);
context.platform = info.systemDetails.platform
context.networkInterfaces = os.networkInterfaces();
context.ram_tot = info.ram.total[0];
context.ram_free = info.ram.free[0];
context.hostname = info.systemDetails.hostname;
context.type = info.systemDetails.type;
context.release = info.systemDetails.release;
context.cpu_core = info.systemDetails.cpu_core;
context.arch = info.systemDetails.arch;
context.uptime = info.systemDetails.uptime;
context.netw_status = info.networkstatus;
context.networkBadge = networkBadge
// context.netw_info_ip = info.network.WiFi[1].address;
context.netw_info_ip = IPV4
context.netwr_name = type;//Object.keys(info.network)[0];
// console.log("rs---->123343");

// var resultForsysram = calculateAvailability('40', '64' );
var resultForsysram = calculateAvailability(info.ram.free[0], info.ram.total[0]);
context.sysRamPerc = resultForsysram.percentageUsed;
context.sysRamstatus = resultForsysram.status
context.sysRamlabel = resultForsysram.badgeStatus
context.sysRamused = resultForsysram.used


// Function to convert bytes to human-readable format
function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

// Function to get disk usage details
// function getDiskUsage() {
if (os.platform() === 'win32') {
    // For Windows systems, use wmic command to get disk usage
    exec('wmic logicaldisk get caption,size,freespace', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing wmic command: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`wmic command stderr: ${stderr}`);
            return;
        }

        // Split the output into lines and process each line
        const lines = stdout.trim().split('\r\r\n');
        lines.forEach((line, index) => {
            if (index === 0) return; // Skip the header
            const [drive, size, freeSpace] = line.trim().split(/\s{2,}/);
            console.log(`Drive: ${drive}, Size: ${bytesToSize(freeSpace)}, Free Space: ${bytesToSize(size)}`);
        });
    });
    //     return {
    //     drive: drive,
    //     space: `${bytesToSize(freeSpace)}`,
    //     freespace: `${bytesToSize(size)}`
    // }; 
} else {
    // For Unix-like systems (Linux, macOS), use df command to get disk usage
    exec('df -k', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing df command: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`df command stderr: ${stderr}`);
            return;
        }

        // Split the output into lines and process each line
        const lines = stdout.trim().split('\n');
        lines.forEach((line, index) => {
            if (index === 0) return; // Skip the header
            const [filesystem, size, used, available, percentage, mount] = line.trim().split(/\s+/);
            console.log(`Filesystem: ${filesystem}, Size: ${bytesToSize(size * 1024)}, Used: ${bytesToSize(used * 1024)}, Available: ${bytesToSize(available * 1024)}, Percentage: ${percentage}, Mount: ${mount}`);
        });
    });
}
// }

// Call the function to get disk usage details
// getDiskUsage();
console.log('Node.js Version:', processInfo.version);

context.nodeJsVersion = processInfo.version

function getJavaVersionSync() {
    try {
        const stdout = execSync('java -version', []);
        const versionRegex = /java version "(.*?)"/;
        // console.log('stdout: ' + versionRegex)
        const match = versionRegex.exec(stdout);
        // console.log('match: ' + match)
        if (match && match[1]) {
            return match[1];
        } else {
            throw new Error('Java version not found');
        }
    } catch (error) {
        throw new Error(`Error getting Java version: ${error.message}`);
    }
}

// Example usage:
try {
    const javaVersion = getJavaVersionSync();
    // console.log('Java Versioqqn:', javaVersion);
} catch (error) {
    console.error('Error:', error.message);
}


context.microservices = [
    { name: 'micro1', status: 'up' },
    { name: 'micro2', status: 'down' },
    { name: 'micro3', status: 'up' },
    { name: 'micro4', status: 'down' }
    // Add more microservices as needed
]




// async function pingServer() {
//     try {
//         const response = await axios.post('http://127.0.0.1:3000/ping');
//         console.log(response.data); // Assuming the response will be { "status": "I'm alive" }
//     } catch (error) {
//         console.error('Error while pinging server:', error);
//     }
// }

// pingServer();

context.logger111 = [
    { logsize: '122kb',serviceName: 'Server', name: 'server.log', content: 'Dummy content for server log. This is a sample log message for the server component. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
    { logsize: '122kb',serviceName: 'Consumer', name: 'consumer.log', content: 'Dummy content for consumer log. This is a sample log message for the consumer component. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
    { logsize: '142kb',serviceName: 'App', name: 'app.log', content: 'Dummy content for app log. This is a sample log message for the app component. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' },
    { logsize: '162kb',serviceName: 'Error', name: 'error.log', content: 'Dummy content for error log. This is a sample log message for the error component. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
    { logsize: '182kb',serviceName: 'Access', name: 'access.log', content: 'Dummy content for access log. This is a sample log message for the access component. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.' },
    { logsize: '102kb',serviceName: 'Debug', name: 'debug.log', content: 'Dummy content for debug log. This is a sample log message for the debug component. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.' },
    { logsize: '112kb',serviceName: 'Event', name: 'event.log', content: 'Dummy content for event log. This is a sample log message for the event component. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.' },
    { logsize: '122kb',serviceName: 'Info', name: 'info.log', content: 'Dummy content for info log. This is a sample log message for the info component. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.' },
    { logsize: '12kb',serviceName: 'Audit', name: 'audit.log', content: 'Dummy content for audit log. This is a sample log message for the audit component. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.' },
    { logsize: '122kb',serviceName: 'Warning', name: 'warning.log', content: 'Dummy content for warning log. This is a sample log message for the warning component. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.' },
    { logsize: '122kb',serviceName: 'Auth', name: 'auth.log', content: 'Dummy content for authentication log. This is a sample log message for the authentication component. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.' },
    { logsize: '22kb',serviceName: 'Transaction', name: 'transaction.log', content: 'Dummy content for transaction log. This is a sample log message for the transaction component. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.' },
    { logsize: '223kb',serviceName: 'System', name: 'system.log', content: 'Dummy content for system log. This is a sample log message for the system component. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.' },
    { logsize: '125kb',serviceName: 'Security', name: 'security.log', content: 'Dummy content for security log. This is a sample log message for the security component. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.' },
    { logsize: '124kb',serviceName: 'Activity', name: 'activity.log', content: 'Dummy content for activity log. This is a sample log message for the activity component. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.' },
    { logsize: '122kb',serviceName: 'Notification', name: 'notification.log', content: 'Dummy content for notification log. This is a sample log message for the notification component. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.' }
  ]




// app.js

const express = require('express');
const app = express();
// const port = 9999;

// Middleware to parse JSON bodies
app.use(express.json());

// POST route to fetch log data
app.post('/logs', (req, res) => {
    try {
        // console.log('inmside axios post api')
        const logName = 'loggg111' //req.body.logName; // Assuming log name is sent in the request body

        // Dummy log data for demonstration
        const dummyLogData = `Dummy log data for log: ${logName}`;

        // Return the dummy log data in the response
        res.json({ logData: dummyLogData });
    } catch (error) {
        console.error('Error fetching log data:', error);
        res.status(500).json({ error: 'Error fetching log data' });
    }
});

// Start the server
// app.listen(port, () => {
//     console.log(`Server is running on!!!`);
// });

// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });


// fetch('http://127.0.0.1:3000/ping', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'sessionid': '142039816965644814796955061150'
//         }
//         // body: JSON.stringify({ logName: 'example.log' })
//     })
//     .then(response => response.json())
//     .then(data => console.log(data))
//     .catch(error => console.error('Error:', error));



// let config = {
//   method: 'get',
//   maxBodyLength: Infinity,
//   url: 'http://127.0.0.1:3000/ping',
//   headers: { 
//     'Content-Type': 'application/json', 
//     'sessionid': '142039816965644814796955061150'
//   }
// };

// axios.request(config)
// .then((response) => {
//   console.log(JSON.stringify(response.data));
// })
// .catch((error) => {
//   console.log(error);
// });


// let config = {
//     method: 'post',
//     maxBodyLength: Infinity,
//     url: 'http://127.0.0.1:3000/ping',
//     headers: {
//         'Content-Type': 'application/json',
//         'sessionid': '142039816965644814796955061150'
//     }
// };

// axios.request(config)
//     .then((response) => {
//         console.log(JSON.stringify(response.data));
//     })
//     .catch((error) => {
//         console.log(error);
//     });


/*---------------------------------------------- Log Analyzer -----------------------------------------------*/

const listoffolders = await page3.db.find({
  table: `(SELECT paramname,paramvalue FROM sys_dashboard_config WHERE GROUP_name = 'logFolderPath' AND deleted = 'N' ORDER BY srno)`,
  filters: filters,
});


  


context.listoffolders = listoffolders;
// const listoffolders = context.listoffolders;
console.log('listoffolders----->',listoffolders)
let folderList = []

const logFolders1 = [
  [
    "IDEAL.war",
    "C:\\IDEAL6_DEV\\wildfly-8.22_uat\\standalone\\deployments\\IDEAL.war\\log",
  ],
  ["pm2-logs", "C:\\IDEAL6_DEV\\pm2-logs"],
  ["nodeconsumer", "C:\\IDEAL6_DEV\\nodeconsumer\\Logs"],
  ["NCenter_IDEAL", "C:\\IDEAL6_DEV\\NCenter_IDEAL\\log"],
  ["idealworkercenter", "C:\\IDEAL6_DEV\\idealworkercenter\\Logs"],
  ["idealetl", "C:\\IDEAL6_DEV\\idealetl\\Logs"],
  ["standalone", "C:\\IDEAL6_DEV\\wildfly-8.22_uat\\standalone\\log"],
  [
    "Consumers_Java",
    "C:\\IDEAL6_DEV\\Installation\\Consumers_Java\\log\\Consumer.log",
  ],
]; // Add your log folder paths here


// function makeObject(folderList){
  
  
//   for(let i = 0;i<folderList.length;i++){
//       folderList.push({
//         "paramname":listoffolders[i]
//       })
//   }

// };
// Function to count log files from specified log folders
function getLogFilesCount1() {
  let totalLogFiles = 0;
  for (const logFolder of listoffolders) {
    // console.log()
    try {
      const files = fs.readdirSync(logFolder.PARAMVALUE);
      // console.log('RS--------------files>',files)
      totalLogFiles += files.length;
    } catch (err) {
      console.error(`Error reading log folder ${logFolder.PARAMVALUE}: ${err}`);
    }
  }
  return totalLogFiles;
}
/////////////////////////

function getLogFilesCount() {
  let totalLogFiles = 0;
  for (const logFolder of listoffolders) {
    console.log('totalLogFiles--->',logFolder)
    try {
      const files = fs.readdirSync(logFolder.PARAMVALUE);
      // console.log('rsss----logFolder====>',logFolder)
      // console.log('rsss----log====>',files)
      console.log('totalLogFiles---logFolder.PARAMVALUE>',logFolder.PARAMVALUE)
      totalLogFiles += files.length;
    } catch (err) {
      console.error(`Error reading log folder ${logFolder.PARAMVALUE}: ${err}`);
    }
  }
  return totalLogFiles;
}

////////////////////////



// Function to calculate the total log size from different log folders
function getTotalLogSize() {
  let totalSizeBytes = 0;
  for (const logFolder of listoffolders) {
    try {
      console.log('logFolder.PARAMVALUE getTotalLogSize-->',logFolder.PARAMVALUE)
      // const files = fs.readdirSync(logFolder[1]);
      const files = fs.readdirSync(logFolder.PARAMVALUE);
      // console.log('getTotalLogSize::',files)
      for (const file of files) {
        const filePath = path.join(logFolder.PARAMVALUE, file);
        console.log('filePath------>',filePath)
        const stats = fs.statSync(filePath);
        totalSizeBytes += stats.size;
      }
    } catch (err) {
      console.error(`Error reading log folder--> getTotalLogSize: ${logFolder.PARAMVALUE}: ${err}`);
    }
  }

  const totalSizeGB = formatSize(totalSizeBytes); //(totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2);
  return totalSizeGB;
}

// Function to get log folder details with service name, path, and size
function getLogFolderDetails() {
  const logFolderDetails = [];
  for (const logFolder of listoffolders) {
  // for (const logFolder of logFolders) {listoffolders
    try {
      const serviceName = logFolder.PARAMNAME; //path.basename(logFolder);
      console.log('serviceName---->',logFolder);
      // const files = fs.readdirSync(logFolder[1]);
      const files = fs.readdirSync(logFolder.PARAMVALUE);
      console.log('rss-files-->',files)
      let totalSizeBytes = 0;
      for (const file of files) {
        const filePath = path.join(logFolder.PARAMVALUE, file);
        const stats = fs.statSync(filePath);
        totalSizeBytes += stats.size;
      }
      const logFolderSizeGB = formatSize(totalSizeBytes); //(totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2);
      logFolderDetails.push({
        serviceName,
        logFolderPath: logFolder.PARAMVALUE,
        logFolderSize: logFolderSizeGB,
        rawtotalSizeBytes: totalSizeBytes,
      });
    } catch (err) {
      console.error(`Error reading log folder ${logFolder.PARAMVALUE}: ${err}`);
    }
  }
  return logFolderDetails;
}
// Function to delete logs from the specified folder
function purgeLogs(logFolder) {
  try {
    const files = fs.readdirSync(logFolder);
    for (const file of files) {
      const filePath = path.join(logFolder, file);
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
    console.log(`All log files in ${logFolder} have been purged.`);
  } catch (err) {
    console.error(`Error purging logs in ${logFolder}: ${err}`);
  }
}

function formatSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

const logAnalyzer = {
  totalLogFiles: getLogFilesCount(),
  totalLogSize: getTotalLogSize(),
  deatiledLogInformation: getLogFolderDetails(),
};

context.loganalyzer = logAnalyzer.deatiledLogInformation;
context.loganalyzer_totalFileSize = logAnalyzer.totalLogFiles;
context.loganalyzer_totalLogSize = logAnalyzer.totalLogSize;

console.log('context.loganalyzer----->'+JSON.stringify(context.loganalyzer))
/*
get logs function
*/

function getFilesInfo(folderPath, allowedExtensions) {
  const filesInfo = [];

  try {
    // Read the contents of the folder
    const fileNames = fs.readdirSync(folderPath);

    // Iterate through the files
    fileNames.forEach((fileName) => {
      const filePath = path.join(folderPath, fileName);

      // Check if it's a file
      if (fs.statSync(filePath).isFile()) {
        // Check if the file has an allowed extension
        const fileExtension = path.extname(fileName).toLowerCase().slice(1); // Slice removes the dot from the extension
        if (allowedExtensions.includes(fileExtension)) {
          // Get the file size in bytes
          const fileSizeBytes = fs.statSync(filePath).size;

          // Convert file size to GB
          const fileSizeGB = formatSize(fileSizeBytes);

          // Add file information to the array
          filesInfo.push({
            Filepath: filePath,
            Logname: fileName,
            Size: fileSizeGB,
          });
        }
      }
    });
  } catch (error) {
    //console.log(error);
    console.error('Error reading folder:', error);
  }

  return filesInfo;
}

// Example usage
const folderPath = "C:/IDEAL6_DEV/nodeconsumer/Logs"; //msg.payload.path;
const allowedExtensions = ["txt", "log", "jpg"]; // Add your allowed file extensions here
 
const filesInfo = getFilesInfo(folderPath, allowedExtensions);
// console.log("rs---------->", filesInfo);
context.filesInfo = filesInfo;
//msg.payload = filesInfo;-----
console.log("rs------------------------->express");
// const express = require("express");
// console.log("https--->", express);
context.logData = [{
    Filepath: 'C:\\IDEAL6_DEV\\nodeconsumer\\Logs\\2023-09-25-result.log',
    Logname: '2023-09-25-result.log',
    Size: '7.26 KB'
  },
  {
    Filepath: 'C:\\IDEAL6_DEV\\nodeconsumer\\Logs\\2023-12-07-result.log',
    Logname: '2023-12-07-result.log',
    Size: '14.01 KB'
  }]


console.log('raasssss----->')
// console.log('db_version--->',db_version[0].BANNER)\\\







async function getLogData2() {
  let logData = [];
  let srno = 1;
  for (const logFolder of listoffolders) {
    try {
      const files = await fs.readdir(logFolder.PARAMVALUE);
      for (const file of files) {
        const filePath = path.join(logFolder.PARAMVALUE, file);
        const stats = await fs.stat(filePath);
        const fileSize = formatSize(stats.size);
        const serviceName = logFolder.PARAMNAME; // Implement this function to extract service name from file name
        const content = await fs.readFile(filePath, 'utf8');
        logData.push({ srno: srno++, logsize: fileSize, serviceName, filename: file, content });
      }
    } catch (err) {
      console.error(`Error reading log folder--> getLogData: ${logFolder.PARAMVALUE}: ${err}`);
    }
  }
  return logData;
}

// let filelistdata = getLogData();
// context.logger = filelistdata;

// console.log('filelistdata--->',filelistdata)

async function getLogData23() {
let logData = [];
  let srno = 1;
  for (const logFolder of listoffolders) {
    try {
      const files = fs.readdirSync(logFolder.PARAMVALUE);
      for (const file of files) {
        
        const filePath = path.join(logFolder.PARAMVALUE, file);
        const stats = fs.statSync(filePath);
        const fileSize = formatSize(stats.size);
        const serviceName = logFolder.PARAMNAME; // Implement this function to extract service name from file name
        const content = fs.readFileSync(filePath);
        // logData.push({ srno:srno++,logsize: fileSize, serviceName, filename: file, content });
        logData.push({ srno:srno++,logsize: fileSize, serviceName, filename: file, content:content });
      }
    } catch (err) {
      console.error(`Error reading log folder--> getLogData: ${logFolder.PARAMVALUE}: ${err}`);
    }
  }
  return logData;
}


async function getLogData33() {
  let logData = [];
  let srno = 1;
  for (const logFolder of listoffolders) {
    try {
      const files = fs.readdirSync(logFolder.PARAMVALUE);
      for (const file of files) {
        try {
          const filePath = path.join(logFolder.PARAMVALUE, file);
          const stats = fs.statSync(filePath);
          const fileSize = formatSize(stats.size);
          const serviceName = logFolder.PARAMNAME; // Implement this function to extract service name from file name
          // const content = fs.readFileSync(filePath,'utf8');
          const content = fs.readFileSync(filePath).toString('utf8');
          logData.push({ srno: srno++, logsize: fileSize, serviceName, filename: file, content: '' });
        } catch (innerErr) {
          console.error(`Error reading file ${file} in ${logFolder.PARAMVALUE}: ${innerErr}`);
        }
      }
    } catch (err) {
      console.error(`Error reading log folder ${logFolder.PARAMVALUE}: ${err}`);
    }
  }
  return logData;
}

const zlib = require('zlib');

async function getLogData22() {
  let logData = [];
  let srno = 1;
  for (const logFolder of listoffolders) {
    try {
      const files = fs.readdirSync(logFolder.PARAMVALUE);
      for (const file of files) {
        try {
          const filePath = path.join(logFolder.PARAMVALUE, file);
          const stats = fs.statSync(filePath);
          const fileSize = formatSize(stats.size);
          const serviceName = logFolder.PARAMNAME;

          // Read the content of the file
          const content = fs.readFileSync(filePath, 'utf8');

          // Compress the content using gzip
          const compressedContent = zlib.gzipSync(content);

          logData.push({
            srno: srno++,
            logsize: fileSize,
            serviceName,
            filename: file,
            // Store the compressed content
            content: compressedContent.toString('base64') // Convert to base64 to store binary data in JSON
          });
        } catch (innerErr) {
          console.error(`Error reading file ${file} in ${logFolder.PARAMVALUE}: ${innerErr}`);
        }
      }
    } catch (err) {
      console.error(`Error reading log folder ${logFolder.PARAMVALUE}: ${err}`);
    }
  }
  return logData;
}



const readline = require('readline');


async function getLatestLogData() {
  let lastlogData = [];
    let srno = 1;

  // Get today's and yesterday's date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Function to read and print last 20 lines from a file
  async function readLast20Lines(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lines = [];
    for await (const line of rl) {
      lines.push(line);
      if (lines.length > 20) {
        lines.shift(); // Keep only the last 20 lines
      }
    }

    return lines.join('\n');
  }

  for (const logFolder of listoffolders) {
    try {
      const files = fs.readdirSync(logFolder.PARAMVALUE);
      for (const file of files) {
        try {
          const filePath = path.join(logFolder.PARAMVALUE, file);
          const stats = fs.statSync(filePath);

          // Exclude .json files
          if (path.extname(file).toLowerCase() === '.json') {
            continue;
          }

          // Check if the file is for today or yesterday
          const fileDate = new Date(stats.mtime);
          if (fileDate.toDateString() === today.toDateString() || fileDate.toDateString() === yesterday.toDateString()) {
            const fileSize = formatSize(stats.size);
            const serviceName = logFolder.PARAMNAME;

            // Read and print last 20 lines from the file
            const last20Lines = await readLast20Lines(filePath);

            lastlogData.push({
              srno:srno++,
              serviceName,
              filename: file,
              last20Lines
            });
          }
        } catch (innerErr) {
          console.error(`Error reading file ${file} in ${logFolder.PARAMVALUE}: ${innerErr}`);
        }
      }
    } catch (err) {
      console.error(`Error reading log folder ${logFolder.PARAMVALUE}: ${err}`);
    }
  }

  return lastlogData;
}
getLatestLogData().then(logData => {
    console.log('getLatestLogData lastlogData------->',logData); // Do something with the log data
    
  })
  .catch(error => {
    console.error('Error fetching log data:', error);
  });


// getLogData().then(logData => {
//     console.log('logData------->',logData); // Do something with the log data
//     context.logger = logData;
//   })
//   .catch(error => {
//     console.error('Error fetching log data:', error);
//   });

// context.logger =[]///getLogData()

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const randomString = generateRandomString(200);
console.log('randomString--->',randomString);


function parseSizeString(sizeString) {
    const units = {
        'Bytes': 1,
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024,
        'TB': 1024 * 1024 * 1024 * 1024
    };

    const [size, unit] = sizeString.split(' ');
    return parseFloat(size) * units[unit];
}

function setLogLevelColor(logSizeString, limitInMB) {
    const logSize = parseSizeString(logSizeString);
    const limitInBytes = limitInMB * 1024 * 1024; // Convert limit from MB to bytes

    let color = '';
    let levelStatus = '';
    let status_description = '';

    if (logSize > limitInBytes) {
        color = '#e22727c9'; // or any other color for exceeding the limit
        levelStatus = 'High';
        status_description = 'HIGH!!!'
    } else if (logSize > 0.8 * limitInBytes) {
        color = '#d4ae309d'; // or any other color for near the limit
        levelStatus = 'Medium';
        status_description = 'Medium!!!'
    } else {
        color = '#36d4309d'; // or any other color for below the limit
        levelStatus = 'Low';
        status_description = 'Low!!!'
    }

    return { color, levelStatus, status_description };
}

// Example usage:
const logSize = getTotalLogSize(); // Assuming this returns something like "5 MB"
const limitInMB = LOG_SIZE_LIMIT; // Assume this comes from the database
const { color, levelStatus, status_description } = setLogLevelColor(logSize, limitInMB);
context.LOG_LEVEL_COLOR = color;
context.LOG_LEVEL_STATUS = levelStatus;
console.log('context.LOG_LEVEL_STATUS-->',context.LOG_LEVEL_STATUS)
context.status_description = status_description
console.log(`Color: ${color}, Level Status: ${levelStatus}`);
console.log(`Color: ${color}, Level Status: ${levelStatus} ,logSize:  ${logSize} , limitInMB: ${limitInMB}`);

// console.log('os--->', os)
console.log('os.arch--->', os.arch())
console.log('os.loadavg--->', os.loadavg())
console.log('os.userInfo--->', os.userInfo())

console.log('os.version--->', os.version())
console.log('os.machine--->', os.machine())


context.services = [
  {
  "srno":"0",
  "serviceName":"ncenter_ideal",
  "size":"134mb"
  },
  {
    "srno":"1",
  "serviceName":"nodeconsumer",
  "size":"64mb"
  },
  {
    "srno":"2",
  "serviceName":"idealetl",
  "size":"94mb"
  },
  {
    "srno":"3",
  "serviceName":"idealworker",
  "size":"234mb"
  },
  {
    "srno":"4",
  "serviceName":"IDEAL.war",
  "size":"450mb"
  },
  {
    "srno":"5",
  "serviceName":"idealworker",
  "size":"234mb"
  },
  {
    "srno":"6",
  "serviceName":"IDEAL.war",
  "size":"450mb"
  },
]


context.logDistribution = [
  {
  "srno":"0",
  "serviceName":"ncenter_ideal",
  "files":"10",
  "size":"1mb"
  },
  {
    "srno":"1",
  "serviceName":"nodeconsumer",
  "files":"40",
  "size":"64mb"
  },
  {
    "srno":"2",
  "serviceName":"idealetl",
  "files":"10",
  "size":"9mb"
  },
  {
    "srno":"3",
  "serviceName":"idealworker",
  "files":"100",
  "size":"234mb"
  },
  {
    "srno":"4",
  "serviceName":"IDEAL.war",
  "files":"30",
  "size":"40mb"
  },
  {
    "srno":"5",
  "serviceName":"idealworker",
  "files":"80",
  "size":"134mb"
  },
  {
    "srno":"6",
  "serviceName":"IDEAL.war",
  "files":"4",
  "size":"50mb"
  },
]


context.logDatas = [
  {
    srno: 1,
    serviceName: 'nodeservicecenter',
    filename: '2024-03-27-result.log',
    last20Lines: "  (SELECT SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') from dual) AS SCHEMA_NAME,\n" +
      "  (SELECT TO_CHAR(value / POWER(2, 30), '999.99') FROM V$OSSTAT WHERE  stat_name IN ('FREE_MEMORY_BYTES')) AS FreeRAM,\n" +
      "  (SELECT TO_CHAR(value / POWER(2, 30), '999.99') FROM V$OSSTAT WHERE  stat_name IN ('PHYSICAL_MEMORY_BYTES')) AS TotalRAM,\n" +
      '  (SELECT COUNT(*) FROM DBA_USERS) AS TOTAL_USERS,\n' +
      "  (SELECT LTrim(TO_CHAR(TO_NUMBER(VALUE/100) * 100, '999.99')) || ' %' FROM V$SYSMETRIC WHERE METRIC_NAME = 'CPU Usage Per Sec') AS Value,\n" +
      "  (SELECT TO_CHAR(STARTUP_TIME, 'DD-MON-YYYY HH:MI AM')  FROM V$INSTANCE) AS DATABASE_STARTUP_TIME,\n" +
      "  (SELECT TO_CHAR(SUM(bytes) / POWER(2, 30), '999.99') || ' GB' FROM dba_segments) AS TOTAL_SIZE_MB,\n" +
      "  (SELECT Count(loginid) tot_users FROM userlist WHERE active = 'T' AND cl_locked = 'N') AS ACT_USER,\n" +
      '  (SELECT Count(loginid) act_users FROM userlist) AS TOT_USERS,\n' +
      "  (SELECT Count(loginid) tot_con_users FROM userlist WHERE connected = 'Y' AND active = 'T' AND cl_locked = 'N') AS TOT_CON_USERS,\n" +
      "  (SELECT Count(loginid) tot_inac_users FROM  userlist WHERE connected = 'N' AND active = 'T' AND cl_locked = 'N') AS TOT_INAC_USERS,\n" +
      "  (SELECT Count(loginid) tot_del_users FROM  userlist WHERE connected = 'N' AND active = 'F' AND cl_locked in ('Y','N')) AS TOT_DEL_USERS,\n" +
      '  (SELECT patch_no curr_patch_no FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) curr_patch_no,\n' +
      '  (SELECT prev_patch_no FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) prev_patch_no,\n' +
      '  (SELECT release_date FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) release_date,\n' +
      '  (SELECT applied_on FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) APPLIED_ON ,\n' +
      "  (SELECT paramvalue FROM sys_dashboard_config  WHERE paramname = 'log_size_limit') LOG_SIZE_LIMIT\n" +
      'FROM dual) where 1=1  \n' +
      "2024-03-27 23:58:06 [request-id:c10bb2a0-ec67-11ee-bc6e-6b02ec116b6e]: info: Query :select * from (SELECT paramname,paramvalue FROM sys_dashboard_config WHERE GROUP_name = 'logFolderPath' AND deleted = 'N' ORDER BY srno) where 1=1  \n" +
      '2024-03-27 23:58:06 [request-id:c10bb2a0-ec67-11ee-bc6e-6b02ec116b6e]: info: ::ffff:127.0.0.1 - 414.136 ms - POST /pagebuilder/page/process/sysdashboarddark - 200 https://127.0.0.1/page-builder/dist/ Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 '
  },
  {
    srno: 2,
    serviceName: 'nodeservicecenter',
    filename: '2024-03-28-result.log',
    last20Lines: "  (SELECT SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') from dual) AS SCHEMA_NAME,\n" +
      "  (SELECT TO_CHAR(value / POWER(2, 30), '999.99') FROM V$OSSTAT WHERE  stat_name IN ('FREE_MEMORY_BYTES')) AS FreeRAM,\n" +
      "  (SELECT TO_CHAR(value / POWER(2, 30), '999.99') FROM V$OSSTAT WHERE  stat_name IN ('PHYSICAL_MEMORY_BYTES')) AS TotalRAM,\n" +
      '  (SELECT COUNT(*) FROM DBA_USERS) AS TOTAL_USERS,\n' +
      "  (SELECT LTrim(TO_CHAR(TO_NUMBER(VALUE/100) * 100, '999.99')) || ' %' FROM V$SYSMETRIC WHERE METRIC_NAME = 'CPU Usage Per Sec') AS Value,\n" +
      "  (SELECT TO_CHAR(STARTUP_TIME, 'DD-MON-YYYY HH:MI AM')  FROM V$INSTANCE) AS DATABASE_STARTUP_TIME,\n" +
      "  (SELECT TO_CHAR(SUM(bytes) / POWER(2, 30), '999.99') || ' GB' FROM dba_segments) AS TOTAL_SIZE_MB,\n" +
      "  (SELECT Count(loginid) tot_users FROM userlist WHERE active = 'T' AND cl_locked = 'N') AS ACT_USER,\n" +
      '  (SELECT Count(loginid) act_users FROM userlist) AS TOT_USERS,\n' +
      "  (SELECT Count(loginid) tot_con_users FROM userlist WHERE connected = 'Y' AND active = 'T' AND cl_locked = 'N') AS TOT_CON_USERS,\n" +
      "  (SELECT Count(loginid) tot_inac_users FROM  userlist WHERE connected = 'N' AND active = 'T' AND cl_locked = 'N') AS TOT_INAC_USERS,\n" +
      "  (SELECT Count(loginid) tot_del_users FROM  userlist WHERE connected = 'N' AND active = 'F' AND cl_locked in ('Y','N')) AS TOT_DEL_USERS,\n" +
      '  (SELECT patch_no curr_patch_no FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) curr_patch_no,\n' +
      '  (SELECT prev_patch_no FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) prev_patch_no,\n' +
      '  (SELECT release_date FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) release_date,\n' +
      '  (SELECT applied_on FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) APPLIED_ON ,\n' +
      "  (SELECT paramvalue FROM sys_dashboard_config  WHERE paramname = 'log_size_limit') LOG_SIZE_LIMIT\n" +
      'FROM dual) where 1=1  \n' +
      "2024-03-28 21:17:00 [request-id:6a6635c0-ed1a-11ee-88a5-914421f51775]: info: Query :select * from (SELECT paramname,paramvalue FROM sys_dashboard_config WHERE GROUP_name = 'logFolderPath' AND deleted = 'N' ORDER BY srno) where 1=1  \n" +
      '2024-03-28 21:17:00 [request-id:6a6635c0-ed1a-11ee-88a5-914421f51775]: info: ::ffff:127.0.0.1 - 394.164 ms - POST /pagebuilder/page/process/sysdashboarddark - 200 https://127.0.0.1/page-builder/dist/ Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 '
  },
  {
    srno: 3,
    serviceName: 'idealworkercenter',
    filename: '2024-03-16-result - Copy.log',
    last20Lines: 'Nunc aliquet aliquam commodo. In imperdiet quam nec magna pretium faucibus. Pellentesque posuere, lorem in aliquam venenatis, lectus eros aliquam nulla, vel tristique urna libero non libero. Ut posuere mi non libero gravida, a tempus purus aliquet. In hac habitasse platea dictumst. Proin pulvinar pharetra lacus, id tempus ex venenatis nec. Vestibulum eleifend mauris vitae tortor mollis, ut sagittis est efficitur. Nunc eget rhoncus ante. Integer in ipsum tincidunt turpis volutpat pellentesque.\n' +
      'v\n' +
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vel efficitur augue, non feugiat orci. Integer id pretium tortor. Vestibulum et elit eget quam auctor porta in in mi. Curabitur accumsan blandit orci, quis viverra lectus consequat ac. Nullam hendrerit, nibh in venenatis pharetra, dui orci eleifend neque, eget interdum erat ligula quis elit. Fusce non risus nibh. Phasellus sit amet purus suscipit, venenatis arcu vel, vehicula lacus. Cras semper dictum neque sit amet mattis. Donec interdum diam eget nisl accumsan, at gravida risus fermentum. Sed tempor ex magna, id pellentesque nisl suscipit ullamcorper. Proin imperdiet ut ante eget volutpat. Nullam id vulputate orci, sed cursus sem.\n' +
      '\n' +
      'Curabitur ac purus elit. Nulla condimentum, sem nec ultrices venenatis, erat felis eleifend lectus, ut cursus turpis metus id tortor. Donec nec mi a mauris pharetra tincidunt. Nulla egestas libero a sapien porttitor, ac mattis velit pulvinar. Pellentesque ullamcorper suscipit nisl vitae molestie. Duis sem ipsum, placerat vel ornare eu, ultricies at lorem. Morbi vel tortor sit amet magna rutrum volutpat eget ut augue.\n' +
      '\n' +
      'Aenean efficitur ipsum egestas tincidunt sagittis. Sed mollis vulputate risus at congue. Maecenas congue dictum neque, id volutpat nisi ultricies et. Aenean eu fermentum tortor. Vivamus risus turpis, elementum ut malesuada tempor, ultricies sed mi. Proin eleifend id tellus nec vestibulum. Duis rutrum massa ac odio euismod, vitae tempus metus mattis. Praesent vel placerat nulla. Nulla facilisi. Ut non augue in elit sollicitudin porta eget quis est. Sed tempor interdum finibus.\n' +
      '\n' +
      'Vestibulum vitae porta libero. Morbi placerat mi ut felis cursus, et aliquam leo tempus. Donec mattis lectus vitae tellus eleifend molestie. Suspendisse ut efficitur nunc. Nam et consequat tortor. Suspendisse sit amet congue odio. Maecenas urna mi, ullamcorper sed orci in, suscipit tempus arcu. Integer ut nisl ac leo ultricies dictum et quis ligula. Donec in lacinia nibh, at lobortis eros. Vivamus urna purus, malesuada at magna ac, ultrices euismod tortor. Sed ullamcorper magna ac auctor varius. Duis euismod venenatis ex. Quisque at accumsan urna, quis porta odio. Integer quis accumsan lorem. Praesent accumsan metus massa, id ultrices magna facilisis vitae.\n' +
      '\n' +
      'Nunc aliquet aliquam commodo. In imperdiet quam nec magna pretium faucibus. Pellentesque posuere, lorem in aliquam venenatis, lectus eros aliquam nulla, vel tristique urna libero non libero. Ut posuere mi non libero gravida, a tempus purus aliquet. In hac habitasse platea dictumst. Proin pulvinar pharetra lacus, id tempus ex venenatis nec. Vestibulum eleifend mauris vitae tortor mollis, ut sagittis est efficitur. Nunc eget rhoncus ante. Integer in ipsum tincidunt turpis volutpat pellentesque.\n' +
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vel efficitur augue, non feugiat orci. Integer id pretium tortor. Vestibulum et elit eget quam auctor porta in in mi. Curabitur accumsan blandit orci, quis viverra lectus consequat ac. Nullam hendrerit, nibh in venenatis pharetra, dui orci eleifend neque, eget interdum erat ligula quis elit. Fusce non risus nibh. Phasellus sit amet purus suscipit, venenatis arcu vel, vehicula lacus. Cras semper dictum neque sit amet mattis. Donec interdum diam eget nisl accumsan, at gravida risus fermentum. Sed tempor ex magna, id pellentesque nisl suscipit ullamcorper. Proin imperdiet ut ante eget volutpat. Nullam id vulputate orci, sed cursus sem.\n' +
      '\n' +
      'Curabitur ac purus elit. Nulla condimentum, sem nec ultrices venenatis, erat felis eleifend lectus, ut cursus turpis metus id tortor. Donec nec mi a mauris pharetra tincidunt. Nulla egestas libero a sapien porttitor, ac mattis velit pulvinar. Pellentesque ullamcorper suscipit nisl vitae molestie. Duis sem ipsum, placerat vel ornare eu, ultricies at lorem. Morbi vel tortor sit amet magna rutrum volutpat eget ut augue.\n' +
      '\n' +
      'Aenean efficitur ipsum egestas tincidunt sagittis. Sed mollis vulputate risus at congue. Maecenas congue dictum neque, id volutpat nisi ultricies et. Aenean eu fermentum tortor. Vivamus risus turpis, elementum ut malesuada tempor, ultricies sed mi. Proin eleifend id tellus nec vestibulum. Duis rutrum massa ac odio euismod, vitae tempus metus mattis. Praesent vel placerat nulla. Nulla facilisi. Ut non augue in elit sollicitudin porta eget quis est. Sed tempor interdum finibus.\n' +
      '\n' +
      'Vestibulum vitae porta libero. Morbi placerat mi ut felis cursus, et aliquam leo tempus. Donec mattis lectus vitae tellus eleifend molestie. Suspendisse ut efficitur nunc. Nam et consequat tortor. Suspendisse sit amet congue odio. Maecenas urna mi, ullamcorper sed orci in, suscipit tempus arcu. Integer ut nisl ac leo ultricies dictum et quis ligula. Donec in lacinia nibh, at lobortis eros. Vivamus urna purus, malesuada at magna ac, ultrices euismod tortor. Sed ullamcorper magna ac auctor varius. Duis euismod venenatis ex. Quisque at accumsan urna, quis porta odio. Integer quis accumsan lorem. Praesent accumsan metus massa, id ultrices magna facilisis vitae.\n' +
      '\n' +
      'Nunc aliquet aliquam commodo. In imperdiet quam nec magna pretium faucibus. Pellentesque posuere, lorem in aliquam venenatis, lectus eros aliquam nulla, vel tristique urna libero non libero. Ut posuere mi non libero gravida, a tempus purus aliquet. In hac habitasse platea dictumst. Proin pulvinar pharetra lacus, id tempus ex venenatis nec. Vestibulum eleifend mauris vitae tortor mollis, ut sagittis est efficitur. Nunc eget rhoncus ante. Integer in ipsum tincidunt turpis volutpat pellentesque.'
  },
  {
    srno: 4,
    serviceName: 'idealworkercenter',
    filename: 'server1111.log',
    last20Lines: '2024-03-27 15:54:31,577 INFO  [iwebz.iWebzAPI] (default task-57) Service : config,Action : productdefaults, Scope : productdefaults\n' +
      '2024-03-27 15:54:31,579 INFO  [iwebz.iWebzAPI] (default task-56) Web Ticket 546922996188918407684001778280 is valid.\n' +
      "2024-03-27 15:54:31,579 INFO  [iwebz.iWebzAPI] (default task-56) accessqry11:::SELECT 1 FROM iwz_rolepolicy rp,iwz_policy_master pm \tWHERE rp.policy_no = pm.policy_no\tand roleid in ('admin','admin')\tand REST_URL = '/REST/rolepolicy/read' and operation = 'read' and scope in ('ALL','read')\n" +
      '2024-03-27 15:54:31,579 INFO  [iwebz.iWebzAPI] (default task-57) Session id 1:546922996188918407684001778280\n' +
      "2024-03-27 15:54:31,579 INFO  [iwebz.iWebzAPI] (default task-57) Session Query 1: SELECT (timeinterval-diff) timediff ,u.*  FROM  (    select Round(To_Number((SYSDATE - lastconnectedtime) * 24 * 60)) as diff    ,decode((SELECT Count(*) FROM iwz_parameter WHERE paramname='timeout_interval'),0,60,(SELECT paramvalue FROM iwz_parameter WHERE paramname='timeout_interval')) timeinterval    ,u.loginid USER_ID,u.username USER_NAME,u.cl_branch_code branch_code,u.profileid PROFILE_ID,u.cl_user_short_code user_short_code,u.cl_web_ticket    ,u.cl_location location    ,u.cl_counter COUNTER,u.cl_reports_to reports_to,u.cl_entity_code ENTITY_CODE,u.cl_isadmin isadmin,u.is_system  is_system     from userlist u    where cl_web_ticket ='546922996188918407684001778280'     and active='T'  ) u \n" +
      "2024-03-27 15:54:31,582 INFO  [iwebz.iWebzAPI] (default task-56) SELECT  distinct policy_no,allowed FROM (SELECT basepolicy.rolepolicy,basepolicy.policy_no, basepolicy.roleid, rolename, basepolicy.group_name, rest_url, operation, scope, description, nvl(allowed,'n')allowed FROM             (SELECT roleid|| '-' ||policy_no  rolepolicy, policy_no, roleid, rolename, group_name, rest_url, operation, scope, description FROM iwz_role_master rm, iwz_policy_master pm WHERE rm.auth_status = '1') basepolicy,(SELECT roleid|| '-' ||policy_no rolepolicy, policy_no, roleid, 'y'allowed FROM iwz_rolepolicy) rp where basepolicy.rolepolicy = rp.rolepolicy(+)  order by rolename)where roleid in ('admin','admin') and allowed='y' order by policy_no\n" +
      '2024-03-27 15:54:31,585 INFO  [iwebz.iWebzAPI] (default task-57) userconfig.fields.length :: 21\n' +
      '2024-03-27 15:54:31,587 INFO  [iwebz.iWebzAPI] (default task-57) Web Ticket 546922996188918407684001778280 is valid.\n' +
      '2024-03-27 15:54:32,205 INFO  [iwebz.iWebzAPI] (default task-60) Service : rolepolicy,Action : read, Scope : read\n' +
      '2024-03-27 15:54:32,208 INFO  [iwebz.iWebzAPI] (default task-60) Session id 1:546922996188918407684001778280\n' +
      "2024-03-27 15:54:32,209 INFO  [iwebz.iWebzAPI] (default task-60) Session Query 1: SELECT (timeinterval-diff) timediff ,u.*  FROM  (    select Round(To_Number((SYSDATE - lastconnectedtime) * 24 * 60)) as diff    ,decode((SELECT Count(*) FROM iwz_parameter WHERE paramname='timeout_interval'),0,60,(SELECT paramvalue FROM iwz_parameter WHERE paramname='timeout_interval')) timeinterval    ,u.loginid USER_ID,u.username USER_NAME,u.cl_branch_code branch_code,u.profileid PROFILE_ID,u.cl_user_short_code user_short_code,u.cl_web_ticket    ,u.cl_location location    ,u.cl_counter COUNTER,u.cl_reports_to reports_to,u.cl_entity_code ENTITY_CODE,u.cl_isadmin isadmin,u.is_system  is_system     from userlist u    where cl_web_ticket ='546922996188918407684001778280'     and active='T'  ) u \n" +
      '2024-03-27 15:54:32,214 INFO  [iwebz.iWebzAPI] (default task-60) userconfig.fields.length :: 21\n' +
      '2024-03-27 15:54:32,217 INFO  [iwebz.iWebzAPI] (default task-60) Web Ticket 546922996188918407684001778280 is valid.\n' +
      '2024-03-27 15:54:32,217 INFO  [iwebz.iWebzAPI] (default task-61) Service : config,Action : productdefaults, Scope : productdefaults\n' +
      "2024-03-27 15:54:32,217 INFO  [iwebz.iWebzAPI] (default task-60) accessqry11:::SELECT 1 FROM iwz_rolepolicy rp,iwz_policy_master pm \tWHERE rp.policy_no = pm.policy_no\tand roleid in ('admin','admin')\tand REST_URL = '/REST/rolepolicy/read' and operation = 'read' and scope in ('ALL','read')\n" +
      '2024-03-27 15:54:32,219 INFO  [iwebz.iWebzAPI] (default task-61) Session id 1:546922996188918407684001778280\n' +
      "2024-03-27 15:54:32,219 INFO  [iwebz.iWebzAPI] (default task-61) Session Query 1: SELECT (timeinterval-diff) timediff ,u.*  FROM  (    select Round(To_Number((SYSDATE - lastconnectedtime) * 24 * 60)) as diff    ,decode((SELECT Count(*) FROM iwz_parameter WHERE paramname='timeout_interval'),0,60,(SELECT paramvalue FROM iwz_parameter WHERE paramname='timeout_interval')) timeinterval    ,u.loginid USER_ID,u.username USER_NAME,u.cl_branch_code branch_code,u.profileid PROFILE_ID,u.cl_user_short_code user_short_code,u.cl_web_ticket    ,u.cl_location location    ,u.cl_counter COUNTER,u.cl_reports_to reports_to,u.cl_entity_code ENTITY_CODE,u.cl_isadmin isadmin,u.is_system  is_system     from userlist u    where cl_web_ticket ='546922996188918407684001778280'     and active='T'  ) u \n" +
      "2024-03-27 15:54:32,219 INFO  [iwebz.iWebzAPI] (default task-60) SELECT  distinct policy_no,allowed FROM (SELECT basepolicy.rolepolicy,basepolicy.policy_no, basepolicy.roleid, rolename, basepolicy.group_name, rest_url, operation, scope, description, nvl(allowed,'n')allowed FROM             (SELECT roleid|| '-' ||policy_no  rolepolicy, policy_no, roleid, rolename, group_name, rest_url, operation, scope, description FROM iwz_role_master rm, iwz_policy_master pm WHERE rm.auth_status = '1') basepolicy,(SELECT roleid|| '-' ||policy_no rolepolicy, policy_no, roleid, 'y'allowed FROM iwz_rolepolicy) rp where basepolicy.rolepolicy = rp.rolepolicy(+)  order by rolename)where roleid in ('admin','admin') and allowed='y' order by policy_no\n" +
      '2024-03-27 15:54:32,228 INFO  [iwebz.iWebzAPI] (default task-61) userconfig.fields.length :: 21\n' +
      '2024-03-27 15:54:32,230 INFO  [iwebz.iWebzAPI] (default task-61) Web Ticket 546922996188918407684001778280 is valid.'
  },
  {
    srno: 5,
    serviceName: 'jobcenter',
    filename: '2024-03-27-result.log',
    last20Lines: '2024-03-27 15:51:51 info: server listening on 3001'
  },
  {
    srno: 6,
    serviceName: 'jobcenter',
    filename: '2024-03-28-result.log',
    last20Lines: '2024-03-28 09:22:08 info: server listening on 3001'
  },
  {
    srno: 7,
    serviceName: 'ncenter_ideal',
    filename: '2024-03-27Notification.log',
    last20Lines: 'Wed Mar 27 2024 15:54:32 GMT+0530 (India Standard Time) - debug:  hFx_b0AHk5i6Q1VBAAAB=true, LKynvkSIj2kUsCvQAAAH=true, length=2, hFx_b0AHk5i6Q1VBAAAB=true, length=1, LKynvkSIj2kUsCvQAAAH=true, length=1\n' +
      'Wed Mar 27 2024 15:54:35 GMT+0530 (India Standard Time) - debug: Session disconnected [LKynvkSIj2kUsCvQAAAH].\n' +
      'Wed Mar 27 2024 15:54:51 GMT+0530 (India Standard Time) - debug: Session disconnected [hFx_b0AHk5i6Q1VBAAAB].\n' +
      'Wed Mar 27 2024 17:58:00 GMT+0530 (India Standard Time) - debug: User 546922996188918407684001778280 subscribed to collection APP_BUILDER\n' +
      'Wed Mar 27 2024 17:58:00 GMT+0530 (India Standard Time) - debug: Start session.User : null, session: 546922996188918407684001778280 socketid : yV9LQsClXm3jFV0TAAAI\n' +
      'Wed Mar 27 2024 17:58:00 GMT+0530 (India Standard Time) - info: args -----> {"userid":null,"sessionid":"546922996188918407684001778280"}\n' +
      'Wed Mar 27 2024 17:58:00 GMT+0530 (India Standard Time) - info: args.userid -----> null\n' +
      'Wed Mar 27 2024 17:58:00 GMT+0530 (India Standard Time) - info: args.sessionid -----> "546922996188918407684001778280"\n' +
      'Wed Mar 27 2024 17:58:00 GMT+0530 (India Standard Time) - info: docs -----> []\n' +
      'Wed Mar 27 2024 17:58:00 GMT+0530 (India Standard Time) - error: Invalid Session : null : 546922996188918407684001778280\n' +
      'Wed Mar 27 2024 17:58:01 GMT+0530 (India Standard Time) - debug: Session disconnected [yV9LQsClXm3jFV0TAAAI].\n' +
      'Wed Mar 27 2024 18:01:06 GMT+0530 (India Standard Time) - debug: User null subscribed to collection APP_BUILDER\n' +
      'Wed Mar 27 2024 18:01:06 GMT+0530 (India Standard Time) - debug: Start session.User : null, session: null socketid : NqAXNDXRY17oKLvuAAAJ\n' +
      'Wed Mar 27 2024 18:01:06 GMT+0530 (India Standard Time) - info: args -----> {"userid":null,"sessionid":null}\n' +
      'Wed Mar 27 2024 18:01:06 GMT+0530 (India Standard Time) - info: args.userid -----> null\n' +
      'Wed Mar 27 2024 18:01:06 GMT+0530 (India Standard Time) - info: args.sessionid -----> null\n' +
      'Wed Mar 27 2024 18:01:06 GMT+0530 (India Standard Time) - info: docs -----> []\n' +
      'Wed Mar 27 2024 18:01:06 GMT+0530 (India Standard Time) - error: Invalid Session : null : null\n' +
      'Wed Mar 27 2024 18:01:06 GMT+0530 (India Standard Time) - debug: Session disconnected [NqAXNDXRY17oKLvuAAAJ].\n' +
      'Wed Mar 27 2024 18:29:41 GMT+0530 (India Standard Time) - debug: Session disconnected [wzgD76VMJwsjBAhKAAAK].'
  },
  {
    srno: 8,
    serviceName: 'ncenter_ideal',
    filename: '2024-03-28Notification.log',
    last20Lines: 'Thu Mar 28 2024 19:27:33 GMT+0530 (India Standard Time) - debug: Join room mohinirm\n' +
      'Thu Mar 28 2024 19:27:33 GMT+0530 (India Standard Time) - debug:  sQXejOL4McqxvlCuAAAf=true, length=1, sQXejOL4McqxvlCuAAAf=true, 1751nZZ0LkYMe_K-AAAh=true, length=2, 1751nZZ0LkYMe_K-AAAh=true, length=1\n' +
      'Thu Mar 28 2024 19:27:40 GMT+0530 (India Standard Time) - debug: Session disconnected [1751nZZ0LkYMe_K-AAAh].\n' +
      'Thu Mar 28 2024 19:27:40 GMT+0530 (India Standard Time) - debug: Session disconnected [sQXejOL4McqxvlCuAAAf].\n' +
      'Thu Mar 28 2024 19:27:41 GMT+0530 (India Standard Time) - debug: Start session.User : mohinirm, session: 124405769385060144847716537622 socketid : iQMXflM236Aeg7X5AAAi\n' +
      'Thu Mar 28 2024 19:27:41 GMT+0530 (India Standard Time) - info: args -----> {"userid":"mohinirm","sessionid":"124405769385060144847716537622"}\n' +
      'Thu Mar 28 2024 19:27:41 GMT+0530 (India Standard Time) - info: args.userid -----> "mohinirm"\n' +
      'Thu Mar 28 2024 19:27:41 GMT+0530 (India Standard Time) - info: args.sessionid -----> "124405769385060144847716537622"\n' +
      'Thu Mar 28 2024 19:27:41 GMT+0530 (India Standard Time) - info: docs -----> [{"_id":"65fb2ff5be69e204190c62ae","userid":"mohinirm","__v":0,"createdAt":"2024-03-20T18:50:29.425Z","sessionid":"124405769385060144847716537622","updatedAt":"2024-03-28T13:57:31.435Z"}]\n' +
      'Thu Mar 28 2024 19:27:41 GMT+0530 (India Standard Time) - debug: Join room mohinirm\n' +
      'Thu Mar 28 2024 19:27:41 GMT+0530 (India Standard Time) - debug:  iQMXflM236Aeg7X5AAAi=true, length=1, iQMXflM236Aeg7X5AAAi=true, length=1\n' +
      'Thu Mar 28 2024 19:27:44 GMT+0530 (India Standard Time) - debug: Session disconnected [iQMXflM236Aeg7X5AAAi].\n' +
      'Thu Mar 28 2024 20:46:53 GMT+0530 (India Standard Time) - debug: User 124405769385060144847716537622 subscribed to collection APP_BUILDER\n' +
      'Thu Mar 28 2024 20:46:53 GMT+0530 (India Standard Time) - debug: Start session.User : null, session: 124405769385060144847716537622 socketid : -AbOviyo4PCl6fmYAAAj\n' +
      'Thu Mar 28 2024 20:46:53 GMT+0530 (India Standard Time) - info: args -----> {"userid":null,"sessionid":"124405769385060144847716537622"}\n' +
      'Thu Mar 28 2024 20:46:53 GMT+0530 (India Standard Time) - info: args.userid -----> null\n' +
      'Thu Mar 28 2024 20:46:53 GMT+0530 (India Standard Time) - info: args.sessionid -----> "124405769385060144847716537622"\n' +
      'Thu Mar 28 2024 20:46:53 GMT+0530 (India Standard Time) - info: docs -----> []\n' +
      'Thu Mar 28 2024 20:46:53 GMT+0530 (India Standard Time) - error: Invalid Session : null : 124405769385060144847716537622\n' +
      'Thu Mar 28 2024 20:46:53 GMT+0530 (India Standard Time) - debug: Session disconnected [-AbOviyo4PCl6fmYAAAj].'
  },
  {
    srno: 9,
    serviceName: 'nodeservicecenter',
    filename: '2024-03-27-result.log',
    last20Lines: "  (SELECT SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') from dual) AS SCHEMA_NAME,\n" +
      "  (SELECT TO_CHAR(value / POWER(2, 30), '999.99') FROM V$OSSTAT WHERE  stat_name IN ('FREE_MEMORY_BYTES')) AS FreeRAM,\n" +
      "  (SELECT TO_CHAR(value / POWER(2, 30), '999.99') FROM V$OSSTAT WHERE  stat_name IN ('PHYSICAL_MEMORY_BYTES')) AS TotalRAM,\n" +
      '  (SELECT COUNT(*) FROM DBA_USERS) AS TOTAL_USERS,\n' +
      "  (SELECT LTrim(TO_CHAR(TO_NUMBER(VALUE/100) * 100, '999.99')) || ' %' FROM V$SYSMETRIC WHERE METRIC_NAME = 'CPU Usage Per Sec') AS Value,\n" +
      "  (SELECT TO_CHAR(STARTUP_TIME, 'DD-MON-YYYY HH:MI AM')  FROM V$INSTANCE) AS DATABASE_STARTUP_TIME,\n" +
      "  (SELECT TO_CHAR(SUM(bytes) / POWER(2, 30), '999.99') || ' GB' FROM dba_segments) AS TOTAL_SIZE_MB,\n" +
      "  (SELECT Count(loginid) tot_users FROM userlist WHERE active = 'T' AND cl_locked = 'N') AS ACT_USER,\n" +
      '  (SELECT Count(loginid) act_users FROM userlist) AS TOT_USERS,\n' +
      "  (SELECT Count(loginid) tot_con_users FROM userlist WHERE connected = 'Y' AND active = 'T' AND cl_locked = 'N') AS TOT_CON_USERS,\n" +
      "  (SELECT Count(loginid) tot_inac_users FROM  userlist WHERE connected = 'N' AND active = 'T' AND cl_locked = 'N') AS TOT_INAC_USERS,\n" +
      "  (SELECT Count(loginid) tot_del_users FROM  userlist WHERE connected = 'N' AND active = 'F' AND cl_locked in ('Y','N')) AS TOT_DEL_USERS,\n" +
      '  (SELECT patch_no curr_patch_no FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) curr_patch_no,\n' +
      '  (SELECT prev_patch_no FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) prev_patch_no,\n' +
      '  (SELECT release_date FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) release_date,\n' +
      '  (SELECT applied_on FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) APPLIED_ON ,\n' +
      "  (SELECT paramvalue FROM sys_dashboard_config  WHERE paramname = 'log_size_limit') LOG_SIZE_LIMIT\n" +
      'FROM dual) where 1=1  \n' +
      "2024-03-27 23:58:06 [request-id:c10bb2a0-ec67-11ee-bc6e-6b02ec116b6e]: info: Query :select * from (SELECT paramname,paramvalue FROM sys_dashboard_config WHERE GROUP_name = 'logFolderPath' AND deleted = 'N' ORDER BY srno) where 1=1  \n" +
      '2024-03-27 23:58:06 [request-id:c10bb2a0-ec67-11ee-bc6e-6b02ec116b6e]: info: ::ffff:127.0.0.1 - 414.136 ms - POST /pagebuilder/page/process/sysdashboarddark - 200 https://127.0.0.1/page-builder/dist/ Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 '
  },
  {
    srno: 10,
    serviceName: 'nodeservicecenter',
    filename: '2024-03-28-result.log',
    last20Lines: "  (SELECT SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') from dual) AS SCHEMA_NAME,\n" +
      "  (SELECT TO_CHAR(value / POWER(2, 30), '999.99') FROM V$OSSTAT WHERE  stat_name IN ('FREE_MEMORY_BYTES')) AS FreeRAM,\n" +
      "  (SELECT TO_CHAR(value / POWER(2, 30), '999.99') FROM V$OSSTAT WHERE  stat_name IN ('PHYSICAL_MEMORY_BYTES')) AS TotalRAM,\n" +
      '  (SELECT COUNT(*) FROM DBA_USERS) AS TOTAL_USERS,\n' +
      "  (SELECT LTrim(TO_CHAR(TO_NUMBER(VALUE/100) * 100, '999.99')) || ' %' FROM V$SYSMETRIC WHERE METRIC_NAME = 'CPU Usage Per Sec') AS Value,\n" +
      "  (SELECT TO_CHAR(STARTUP_TIME, 'DD-MON-YYYY HH:MI AM')  FROM V$INSTANCE) AS DATABASE_STARTUP_TIME,\n" +
      "  (SELECT TO_CHAR(SUM(bytes) / POWER(2, 30), '999.99') || ' GB' FROM dba_segments) AS TOTAL_SIZE_MB,\n" +
      "  (SELECT Count(loginid) tot_users FROM userlist WHERE active = 'T' AND cl_locked = 'N') AS ACT_USER,\n" +
      '  (SELECT Count(loginid) act_users FROM userlist) AS TOT_USERS,\n' +
      "  (SELECT Count(loginid) tot_con_users FROM userlist WHERE connected = 'Y' AND active = 'T' AND cl_locked = 'N') AS TOT_CON_USERS,\n" +
      "  (SELECT Count(loginid) tot_inac_users FROM  userlist WHERE connected = 'N' AND active = 'T' AND cl_locked = 'N') AS TOT_INAC_USERS,\n" +
      "  (SELECT Count(loginid) tot_del_users FROM  userlist WHERE connected = 'N' AND active = 'F' AND cl_locked in ('Y','N')) AS TOT_DEL_USERS,\n" +
      '  (SELECT patch_no curr_patch_no FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) curr_patch_no,\n' +
      '  (SELECT prev_patch_no FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) prev_patch_no,\n' +
      '  (SELECT release_date FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) release_date,\n' +
      '  (SELECT applied_on FROM ver_patch_master ORDER BY applied_on  DESC FETCH first ROW ONLY) APPLIED_ON ,\n' +
      "  (SELECT paramvalue FROM sys_dashboard_config  WHERE paramname = 'log_size_limit') LOG_SIZE_LIMIT\n" +
      'FROM dual) where 1=1  \n' +
      "2024-03-28 21:17:00 [request-id:6a6635c0-ed1a-11ee-88a5-914421f51775]: info: Query :select * from (SELECT paramname,paramvalue FROM sys_dashboard_config WHERE GROUP_name = 'logFolderPath' AND deleted = 'N' ORDER BY srno) where 1=1  \n" +
      '2024-03-28 21:17:00 [request-id:6a6635c0-ed1a-11ee-88a5-914421f51775]: info: ::ffff:127.0.0.1 - 394.164 ms - POST /pagebuilder/page/process/sysdashboarddark - 200 https://127.0.0.1/page-builder/dist/ Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 '
  }
];
        } catch (error) {
            logger.error(`page id \`sysdashboarddark\` section id \`\` : Error in script data: ` + error.stack);
        }
        return context;
    }
}