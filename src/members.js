members.sort((a, b) => Number(!a.connected) - Number(!b.connected));
// stable sort: ties keep the server order
