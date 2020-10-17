import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';
import { TasksService } from './tasks.service';

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

const mockUser = { id: 2, username: 'Test User' };

const task: [] = [];

describe('TasksService', () => {
  let taskService;
  let taskRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TaskRepository,
          useFactory: mockTaskRepository,
        },
      ],
    }).compile();

    taskService = module.get<TasksService>(TasksService);
    taskRepository = module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('Task repository get tasks have been called', () => {
      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filter: GetTasksFilterDTO = {
        search: 'Something to Search',
        status: TaskStatus.IN_PROGRESS,
      };
      taskService.getTasks(filter, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
    });

    it('task repository returns value', async () => {
      taskRepository.getTasks.mockResolvedValue(task);
      const filter: GetTasksFilterDTO = {
        search: 'Something to Search',
        status: TaskStatus.IN_PROGRESS,
      };
      const tasks = await taskService.getTasks(filter, mockUser);
      expect(tasks).toEqual(task);
    });
  });

  describe('getTaskById', () => {
    it('calls taksRepository.findOne() and returns value', async () => {
      const mockTask = { title: 'Test title', description: 'Test Description' };
      taskRepository.findOne.mockResolvedValue(mockTask);
      expect(taskRepository.findOne).not.toHaveBeenCalled();
      const task = await taskService.getTaskById(1, mockUser);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: mockUser.id },
      });
      expect(task).toEqual(mockTask);
    });

    it('throws exceptions', async () => {
      taskRepository.findOne.mockResolvedValue(null);
      expect(taskService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('Task Repository createTask method is called', async () => {
      expect(taskRepository.createTask).not.toHaveBeenCalled();
      const mockTask = { title: 'Test title', description: 'Test Description' };
      await taskService.createTask(mockTask, mockUser);
      expect(taskRepository.createTask).toHaveBeenLastCalledWith(
        mockTask,
        mockUser,
      );
    });

    it('Task Repository should return a value', async () => {
      const mockTask = { title: 'Test title', description: 'Test Description' };
      taskRepository.createTask.mockResolvedValue(mockTask);
      const result = await taskService.createTask(mockTask, mockUser);
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('Task Repository deleteTask method is called and returns a value', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      const result = await taskService.deleteTaskById(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: 1,
        userId: mockUser.id,
      });
      expect(result).toEqual({ affected: 1 });
    });

    it('Throws Not found Exception', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(
        taskService.deleteTaskById(1, mockUser),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('updateTaskStatus', () => {
    it('Task Service getTaskById is Called and retuns value', async () => {
      const mockTask = {
        title: 'Test title',
        status: TaskStatus.OPEN,
        description: 'Test Description',
      };
      const save = jest.fn().mockResolvedValue(true);
      TasksService.prototype.getTaskById = jest.fn().mockResolvedValue({
        mockTask,
        save,
      });
      Task.prototype.save = jest.fn();

      expect(taskService.getTaskById).not.toHaveBeenCalled();
      const task = await taskService.updateTaskStatus(
        1,
        TaskStatus.IN_PROGRESS,
        mockUser,
      );
      expect(taskService.getTaskById).toHaveBeenCalledWith(1, mockUser);
      expect(task.save).toHaveBeenCalled();
      expect(task.status).toEqual(TaskStatus.IN_PROGRESS);
    });
  });
});
