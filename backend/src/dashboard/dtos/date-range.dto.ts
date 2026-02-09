import { IsDateString } from 'class-validator';

export class DateRangeDto {
  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  startDate: string;

  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  endDate: string;
}
