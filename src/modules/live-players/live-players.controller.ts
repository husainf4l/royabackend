import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { LivePlayersService } from './live-players.service';
import { CreateLivePlayerDto, UpdateLivePlayerDto } from './dto';

@Controller('live-players')
export class LivePlayersController {
  constructor(private readonly livePlayersService: LivePlayersService) {}

  @Get()
  async findAll() {
    return this.livePlayersService.findAll();
  }

  @Get('active')
  async getActivePlayers() {
    return this.livePlayersService.getActiveLivePlayers();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.livePlayersService.findOne(id);
  }

  @Get('player/:playerId')
  async findByPlayerId(@Param('playerId') playerId: string) {
    return this.livePlayersService.findByPlayerId(playerId);
  }

  @Post()
  async create(@Body() createLivePlayerDto: CreateLivePlayerDto) {
    return this.livePlayersService.create(createLivePlayerDto);
  }

  /**
   * Seeds demo data for LivePlayers
   * NOTE: Make sure to run database migrations first:
   * npm run prisma:migrate
   */
  @Post('seed')
  async seedLivePlayerData() {
    return this.livePlayersService.seedDemoData();
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateLivePlayerDto: UpdateLivePlayerDto) {
    return this.livePlayersService.update(id, updateLivePlayerDto);
  }

  @Put(':id/coordinates')
  async updateCoordinates(@Param('id') id: string, @Body() coordinatesData: any) {
    return this.livePlayersService.updatePlayerCoordinates(id, coordinatesData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.livePlayersService.remove(id);
  }
}
