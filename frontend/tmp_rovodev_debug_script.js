// Cole este script no console do navegador para capturar logs

let logCount = 0;
const maxLogs = 50;
const logs = [];

// Interceptar console.log
const originalLog = console.log;
console.log = function(...args) {
  if (logCount < maxLogs) {
    logs.push({
      timestamp: new Date().toISOString(),
      message: args
    });
    logCount++;
  }
  originalLog.apply(console, args);
};

// Após 5 segundos, mostrar resumo
setTimeout(() => {
  console.log('\n=== RESUMO DE LOGS (últimos 50) ===');
  logs.forEach((log, i) => {
    originalLog(`${i + 1}.`, log.timestamp, ...log.message);
  });
  
  // Contar quantas vezes cada log apareceu
  const counts = {};
  logs.forEach(log => {
    const key = JSON.stringify(log.message);
    counts[key] = (counts[key] || 0) + 1;
  });
  
  console.log('\n=== LOGS MAIS FREQUENTES ===');
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([msg, count]) => {
      originalLog(`${count}x:`, msg);
  });
}, 5000);

console.log('🔍 Debug ativado - aguardando 5 segundos...');
