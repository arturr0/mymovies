import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(email: string, password: string) {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return { message: 'User registered successfully', user };
  }

  async login(email: string, password: string) {
    // Fetch the user from the database
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return { message: 'User logged in successfully', user };
  }
}
