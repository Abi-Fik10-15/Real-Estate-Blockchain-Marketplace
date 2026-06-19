import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  @ApiResponse({ status: 201, description: 'Returns JWT accessToken and user' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and receive JWT' })
  @ApiResponse({ status: 201, description: 'Returns JWT accessToken and user' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current user profile' })
  profile(@CurrentUser() user: UserDocument) {
    // JWT strategy already loaded the user — return it directly, no second DB hit
    return user;
  }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, dto);
  }

  @Post('avatar')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload profile photo (JPG/PNG/WEBP, max 5MB)' })
  async uploadAvatar(
    @CurrentUser() user: UserDocument,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG, and WEBP images are allowed');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Image must be 5 MB or smaller');
    }

    try {
      const upload = await this.cloudinaryService.uploadFile(
        file,
        'chainestate/avatars',
      );
      const updatedUser = await this.authService.updateProfile(user.id, {
        avatar: upload.url,
      });
      return {
        url: upload.url,
        publicId: upload.publicId,
        user: updatedUser,
      };
    } catch (error) {
      console.error('Avatar upload failed:', error);
      throw new InternalServerErrorException('Avatar upload failed');
    }
  }
}
