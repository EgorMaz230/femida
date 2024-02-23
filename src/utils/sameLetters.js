module.exports = (content) => {
    for (let i = 1; i < content.length;i++) {
      if (content[i] !== content[i-1]) {
        return true;
      }
    }
    return false;
  }