import discord
from discord.ext import commands, tasks
import asyncio
import random
import re
import os
import requests
import keep_alive
import string
import json

TOKEN = os.environ['TOKEN']
PREFIX = '>'
SPAM_CHANNEL_ID = '1148495060762099753'
OWNER_ID = '727012870683885578'
LOG_CHANNEL_ID = '1148494898979405844'
ERROR_CHANNEL_ID = '1148494775167758386'


bot = commands.Bot(command_prefix=PREFIX, self_bot = True)
is_sleeping = False
allowed_channels = [] 

with open('namefix.json', 'r') as json_file:
    pokemon_list = json.load(json_file)

def solve(message):
    hint = []
    for i in range(15, len(message) - 1):
        if message[i] != '\\':
            hint.append(message[i])
    hint_string = ''
    for i in hint:
        hint_string += i
    hint_replaced = hint_string.replace('_', '.')

    solution = re.findall('^' + hint_replaced + '$', '|'.join(pokemon_list), re.MULTILINE)
    return solution


def check_spawns_remaining(string):
  match = re.search(r'Spawns Remaining : (\d+)', string)
  if match:
    spawns_remaining = int(match.group(1))
    print(spawns_remaining)



intervals = [2.5, 3, 3.5, 4, 4.5, 5]

@tasks.loop(seconds=random.choice(intervals))
async def spam():
    if not is_sleeping:
        channel = bot.get_channel(int(SPAM_CHANNEL_ID))
        message = "".join(random.choices(string.ascii_uppercase + string.ascii_lowercase + string.digits, k=random.randint(12, 24)))
        nmessage = message + " | PokeNemesis Spamming Services Is On"
        await channel.send(nmessage)

@spam.before_loop
async def before_spam():
    await bot.wait_until_ready()

@bot.event
async def on_ready():
    print("PokeNemesis")
    print(" ")
    print(f"Account: {bot.user.name} is ONLINE")
    print(" ")
    print(f"Use {PREFIX}help To Get Started")

    spam.start() 

@bot.event
async def on_error(event, *args, **kwargs):
  print(" [AntiCrash] :: Error")
  print(event, args, kwargs)



@bot.event
async def on_message(message):
    global is_sleeping

    if message.content.startswith(f"{PREFIX}start") and str(
            message.author.id) == OWNER_ID:
        is_sleeping = False
        await message.channel.send("Let's Grind Harder Than Before")

    if message.content.startswith(f"{PREFIX}stop") and str(
            message.author.id) == OWNER_ID:
        is_sleeping = True
        await message.channel.send("I Am Tired, Going To Sleep")

    if message.content == "$solved" and str(message.author.id) == OWNER_ID:
        is_sleeping = False
        await message.channel.send("Let's Grind Harder Than Before")

    if message.content == f"{PREFIX}help" and str(message.author.id) == OWNER_ID:

        help_message = (
            "```"
            " "
            "Poketwo Autocatcher | PokeNemesis\n\n"
            "$help - This Message \n"
            "$stop - Stop Spammer \n"
            "$start - Start Spammer \n"
            "$solved - Start Services After Solving \n"
            "$say <content> - Make The Bot Repeat After You \n\n"
            " "
            "```")

        await message.channel.send(help_message)       
        

    if not is_sleeping:

        if "%" in message.content and str(message.author.id) == "854233015475109888":
          message_content = message.content
          colon_index = message_content.find(':')
          pokemon_name = message_content[:colon_index].strip()
          await message.channel.send(f'<@716390085896962058> c {pokemon_name}')
          print("A Pokemon Spawned | Catching ", pokemon_name)
          log_channel = bot.get_channel(int(LOG_CHANNEL_ID))
          log_message = (f"[ {message.guild.name} ] | "
                            f"** {pokemon_name} **  Caught By PokeNemesis")
          await log_channel.send(log_message)

       
        elif "Please tell us" in message.content and str(
            message.author.id) == "716390085896962058":
            is_sleeping = True
            await message.channel.send(
                F"Autocatcher Stopped, Captcha Detected | Use `{PREFIX}solved` After Solving "
            )
            await asyncio.sleep(18000)
            is_sleeping = False

        elif message.content.startswith(f"{PREFIX}say") and str(
            message.author.id) == OWNER_ID:
            say_text = ' '.join(message.content.split()[1:])
            await message.channel.send(say_text)

        elif message.content == "That is the wrong pokémon!" and str(
            message.author.id) == "716390085896962058":
            await message.channel.send("<@716390085896962058> h")

        elif "The pokémon is" in message.content:
                try:
                  pokemon_hint = message.content 
                  solution = solve(pokemon_hint)
                  if solution:
            
                    print("Solved :", solution)
                  else:
                    print("No Solution Found For :", pokemon_hint)
                    await message.channel.send("No Solution Found For :", pokemon_hint)
                except Exception as e:
                    print(f"Error : {e}")

                log_channel = bot.get_channel(int(LOG_CHANNEL_ID))
                log_message = (f"[ {message.guild.name} ] | "
                            f"** {pokemon_name} **  Caught By PokeNemesis")
                await log_channel.send(log_message)
            

        elif str(message.author.id) == "716390085896962058":
            if message.embeds and message.embeds[
                0].footer and "Spawns Remaining" in message.embeds[0].footer.text:
                await message.channel.send("<@716390085896962058> h")
                if message.embeds[
                    0].footer.text == "Incense: Active.\nSpawns Remaining: 0.":
                    await message.channel.send("<@716390085896962058> buy incense")

            elif "The pokémon is" in message.content:
                try:
                  pokemon_hint = message.content 
                  solution = solve(pokemon_hint)
                  if solution:
            
                    print("Solved :", solution)
                  else:
                    print("No Solution Found For :", pokemon_hint)
                    await message.channel.send("No Solution Found For :", pokemon_hint)
                    
                except Exception as e:
                    print(f"Error : {e}")

                log_channel = bot.get_channel(int(LOG_CHANNEL_ID))
                log_message = (f"[ {message.guild.name} ] | "
                            f"** {pokemon_name} **  Caught By PokeNemesis")
                await log_channel.send(log_message)

    await bot.process_commands(message)


@bot.command()
async def start(ctx):
    global is_sleeping
    is_sleeping = False
    await ctx.send("Autocatcher Started")

@bot.command()
async def stop(ctx):
    global is_sleeping
    is_sleeping = True
    await ctx.send("Autocatcher Stopped")

keep_alive.keep_alive()
bot.run(TOKEN)
