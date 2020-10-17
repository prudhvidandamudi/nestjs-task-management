import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthCredentialsDto } from './dto/auth-credentials-dto';
import { UserRepository } from './user.repository';
let bcrypt = require('bcrypt');

const authCredentialsDto: AuthCredentialsDto = {
  username: 'TestUsername',
  password: 'P@sswOrD',
};

describe('User repository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('SignUp', () => {
    let save;
    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });
    it('it should successfully signs up the user', async () => {
      save.mockResolvedValue(true);
      await expect(
        userRepository.signUp(authCredentialsDto),
      ).resolves.not.toThrowError();
    });
    it('it should throw Conflict Exception', async () => {
      save.mockRejectedValue({ code: '23505' });
      await expect(userRepository.signUp(authCredentialsDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('It Should Throw Internal Server Exception', async () => {
      save.mockRejectedValue({ code: '12356' });
      await expect(userRepository.signUp(authCredentialsDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('SingIn', () => {
    let user;
    it('it should return username successfully', async () => {
      const validatePassword = jest.fn().mockResolvedValue(true);
      user = {
        id: 1,
        username: 'TestUsername',
        password: 'P@ssWord',
        validatePassword,
      };
      userRepository.findOne = jest.fn().mockResolvedValue(user);
      const result = await userRepository.signInValidation(authCredentialsDto);
      expect(result).toEqual(user.username);
    });
    it('it should retun null value', async () => {
      const validatePassword = jest.fn().mockResolvedValue(true);
      user = {
        id: 1,
        username: 'TestUsername',
        password: 'P@ssWord',
        validatePassword,
      };
      userRepository.findOne = jest.fn().mockResolvedValue(false);
      const result = await userRepository.signInValidation(authCredentialsDto);
      expect(result).toEqual(null);
    });

    it('It Should return null on failed password validation', async () => {
      const validatePassword = jest.fn().mockResolvedValue(false);
      user = {
        id: 1,
        username: 'TestUsername',
        password: 'P@ssWord',
        validatePassword,
      };
      userRepository.findOne = jest.fn().mockResolvedValue(user);
      const result = await userRepository.signInValidation(authCredentialsDto);
      expect(result).toEqual(null);
    });
  });

  describe('Genenrate Password Hash', () => {
    it('It should retrun a passwordhash', async () => {
      bcrypt.hash = jest.fn().mockResolvedValue('SomeHash');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await userRepository.generatePasswordHash(
        'TestP@ssword',
        'SomeSalt',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('TestP@ssword', 'SomeSalt');
      expect(result).toEqual('SomeHash');
    });
  });
});
