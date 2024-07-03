class LogService {
  error(msg: string) {
    console.log(`❌ ${msg}`);
  }
}

export default new LogService();
