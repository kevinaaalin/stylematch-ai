param([Parameter(Mandatory=$true)][int]$TargetProcessId, [switch]$DatabasePaths)
$ErrorActionPreference = 'Stop'
# Inspect current directory or the two explicitly allowlisted database path settings.
# Never print credentials or other environment settings.
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class RuntimeDirectory {
 [DllImport("kernel32.dll", SetLastError=true)] static extern IntPtr OpenProcess(uint a, bool i, int p);
 [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr h);
 [DllImport("kernel32.dll", SetLastError=true)] static extern bool ReadProcessMemory(IntPtr h, IntPtr a, byte[] b, int n, out IntPtr r);
 [DllImport("ntdll.dll")] static extern int NtQueryInformationProcess(IntPtr h, int c, IntPtr[] b, int n, out int r);
 static byte[] Read(IntPtr h, long a, int n) { var b=new byte[n]; IntPtr r; if(!ReadProcessMemory(h,new IntPtr(a),b,n,out r)||r.ToInt64()!=n) throw new Exception("Cannot read runtime directory"); return b; }
 public static string Get(int pid) {
  if(IntPtr.Size!=8) throw new Exception("Requires 64-bit PowerShell");
  var h=OpenProcess(0x410,false,pid); if(h==IntPtr.Zero) throw new Exception("Cannot inspect process");
  try { var b=new IntPtr[6]; int r; if(NtQueryInformationProcess(h,0,b,48,out r)!=0) throw new Exception("Cannot inspect PEB");
   long parameters=BitConverter.ToInt64(Read(h,b[1].ToInt64()+0x20,8),0);
   var u=Read(h,parameters+0x38,16); int length=BitConverter.ToUInt16(u,0); long address=BitConverter.ToInt64(u,8);
   if(length<2 || length>32766 || length%2!=0) throw new Exception("Invalid directory field");
   return System.Text.Encoding.Unicode.GetString(Read(h,address,length));
  } finally {CloseHandle(h);}
 }
 public static string GetDatabasePaths(int pid) {
  var h=OpenProcess(0x410,false,pid); if(h==IntPtr.Zero) throw new Exception("Cannot inspect process");
  try { var b=new IntPtr[6]; int r; if(NtQueryInformationProcess(h,0,b,48,out r)!=0) throw new Exception("Cannot inspect PEB");
   long parameters=BitConverter.ToInt64(Read(h,b[1].ToInt64()+0x20,8),0);
   long address=BitConverter.ToInt64(Read(h,parameters+0x80,8),0);
   var value=new System.Text.StringBuilder(); var output=new System.Text.StringBuilder(); bool previousNull=false;
   for(int offset=0;offset<1048576;offset+=2) {
    char ch=(char)BitConverter.ToUInt16(Read(h,address+offset,2),0);
    if(ch=='\0') { if(previousNull) return output.ToString(); var s=value.ToString();
     if(s.StartsWith("ISAFE_DB_PATH=",StringComparison.OrdinalIgnoreCase)||s.StartsWith("ISAFE_DATA_DIR=",StringComparison.OrdinalIgnoreCase)) output.AppendLine(s);
     value.Clear(); previousNull=true;
    } else {value.Append(ch);previousNull=false;}
   } throw new Exception("Environment exceeds bounded inspection limit");
  } finally {CloseHandle(h);}
 }
}
'@
if ($DatabasePaths) { [RuntimeDirectory]::GetDatabasePaths($TargetProcessId) } else { [RuntimeDirectory]::Get($TargetProcessId) }
