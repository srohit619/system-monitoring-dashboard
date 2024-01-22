module.exports = {
    load: async function ({ filters, userobj }) {
        let context = {};
        try {
            /*----------------------------------------- Database Informations -------------------------------------------*/ 

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
  (SELECT TO_CHAR(SUM(bytes) / POWER(2, 30), '999.99') || ' GB' FROM dba_segments) AS TOTAL_SIZE_MB 
FROM dual)`,
  filters: filters,
});

context.dbDeatails = dbDetails;
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

console.log('db_TOTAL_TABLES',dbDetails[0].COUNT);
/*------------------------------------------- System Information --------------------------------------------*/

const os = require("os");
const path = require("path");
const fs = require("fs");

let connectionstatus = "Disconnected";
let IPV4;
let type;

console.log('os.networkInterfaces--->',os.networkInterfaces())



const networkInterfaces = os.networkInterfaces();
console.log('D1')
if (networkInterfaces) {
  if (networkInterfaces.WiFi) {
    console.log('D2')
    // Check if there is a valid IPv4 address in the 'WiFi' section
    const wifiInterface = networkInterfaces.WiFi.find(interface => interface.family === 'IPv4');
    if (wifiInterface && wifiInterface.address) {
      connectionStatus = "Connected";
      IPV4 = wifiInterface.address || 'Null';
      type = "WiFi"
    }
  } else if (networkInterfaces.Ethernet) {
    console.log('D3')
    // Check if there is a valid IPv4 address in the 'Ethernet' section
    const ethernetInterface = networkInterfaces.Ethernet.find(interface => interface.family === 'IPv4');
    if (ethernetInterface && ethernetInterface.address) {
      connectionStatus = "Connected";
      IPV4 = ethernetInterface.address || 'Null';
      console.log('ethernetInterface',interface)
      type = "Ethernet"
    }
    console.log('D4')
  }else  {
    console.log('D5')
      connectionStatus = "Disconnected";
      IPV4 =  'Null';
      type = 'N/A'
    console.log('D6')
  }

  console.log('D7')
}
console.log('IPV4',IPV4 || 'not found')
console.log('Connection Status:', connectionStatus);

////////////////////////////////////

const uptimeInSeconds = os.uptime();
// const uptimeInDays = (uptimeInSeconds / (60 * 60 * 24)).toFixed(2);
const days = Math.floor(uptimeInSeconds / (60 * 60 * 24));
const hours = Math.floor((uptimeInSeconds % (60 * 60 * 24)) / (60 * 60));

const data = os.type();
function sysdetails() {
  const uptimeInSeconds = os.uptime();
  console.log("rs---->", uptimeInSeconds);
  return uptimeInSeconds;
}
console.log("rs---->", data);
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

console.log("rs---->", info);
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
// context.netw_info_ip = info.network.WiFi[1].address;
context.netw_info_ip = IPV4
context.netwr_name = type;//Object.keys(info.network)[0];
console.log("rs---->123343");


/*---------------------------------------------- Log Analyzer -----------------------------------------------*/

const listoffolders = await page3.db.find({
  table: `(SELECT paramname,paramvalue FROM sys_dashboard_config WHERE GROUPname = 'folder-path' AND deleted = 'N' ORDER BY srno)`,
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
      console.log('RS--------------files>',files)
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
      console.log('getTotalLogSize::',files)
      for (const file of files) {
        const filePath = path.join(logFolder.PARAMVALUE, file);
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
// console.log('db_version--->',db_version[0].BANNER)
        } catch (error) {
            logger.error(`page id \`testingexternalmodules\` section id \`\` : Error in script data: ` + error.stack);
        }
        return context;
    }
}