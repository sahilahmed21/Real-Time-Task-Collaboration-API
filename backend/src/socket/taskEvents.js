
module.exports = (io, socket) => {
    const handleTaskUpdate = (payload) => {
        console.log(`Received task update event for task ${payload.taskId} from client ${socket.id}`);
        if (payload.teamId && payload.updatedTaskData) {
            socket.broadcast.to(`team:${payload.teamId}`).emit('task:updated', payload.updatedTaskData);
        }
    }
    socket.on('task:client:update', handleTaskUpdate);
}