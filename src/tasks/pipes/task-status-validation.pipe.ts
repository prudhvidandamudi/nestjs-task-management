import { PipeTransform, NotAcceptableException } from '@nestjs/common';
import { TaskStatus } from '../task-status.enum';

export class TaskStatusValidation implements PipeTransform {
  transform(value: any) {
    if (!this.isValidStatus(value)) {
      throw new NotAcceptableException(`${value} is invalid`);
    }
    return value;
  }

  private isValidStatus(value: string): boolean {
    console.log(value);
    if ((<any>Object).values(TaskStatus).includes(value)) {
      return true;
    } else {
      return false;
    }
  }
}
