/*
 * Luna Setup Bot
 *
 * Enige Railway-variable:
 *   DISCORD_TOKEN = geheim bot-token
 *
 * Start daarna de bot en gebruik in Discord:
 *   /luna-setup bevestigen:Ja
 *
 * De setup verwijdert niets. Bestaande rollen, categorieën en kanalen met
 * dezelfde naam worden hergebruikt; alleen ontbrekende onderdelen ontstaan.
 */

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  MessageFlags,
  OverwriteType,
  PermissionFlagsBits,
  PermissionsBitField,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;
const SERVER_NAME = "Luna’s Chillings 🌙";
const MARKER = "luna-setup-bot:v1";

if (!TOKEN) {
  console.error("Ontbrekende Railway-variable: DISCORD_TOKEN.");
  process.exit(1);
}

const ROLE_SPECS = [
  {
    key: "luna",
    name: "🌙・Luna",
    color: 0x8b5cf6,
    hoist: true,
    permissions: [
      "ManageGuild",
      "ManageRoles",
      "ManageChannels",
      "KickMembers",
      "BanMembers",
      "ModerateMembers",
      "ManageMessages",
      "ManageNicknames",
      "ViewAuditLog"
    ]
  },
  {
    key: "admin",
    name: "👑・Admin",
    color: 0xf59e0b,
    hoist: true,
    permissions: [
      "ManageRoles",
      "ManageChannels",
      "KickMembers",
      "BanMembers",
      "ModerateMembers",
      "ManageMessages",
      "ManageNicknames",
      "ViewAuditLog"
    ]
  },
  {
    key: "headmod",
    name: "🛡️・Hoofdmoderator",
    color: 0xef4444,
    hoist: true,
    permissions: ["KickMembers", "BanMembers", "ModerateMembers", "ManageMessages", "ManageNicknames", "ViewAuditLog"]
  },
  {
    key: "moderator",
    name: "🔨・Moderator",
    color: 0xf97316,
    hoist: true,
    permissions: ["KickMembers", "ModerateMembers", "ManageMessages", "ManageNicknames"]
  },
  { key: "creator", name: "🎨・Creator", color: 0xec4899, hoist: true, permissions: [] },
  { key: "booster", name: "💎・Booster", color: 0xd946ef, hoist: true, permissions: [] },
  { key: "legend", name: "⭐・Chilling Legend", color: 0xfacc15, hoist: true, permissions: [] },
  { key: "regular", name: "💜・Chilling Regular", color: 0xa855f7, hoist: false, permissions: [] },
  { key: "newcomer", name: "🌱・Nieuweling", color: 0x22c55e, hoist: false, permissions: [] },
  { key: "verified", name: "✅・Geverifieerd", color: 0x06b6d4, hoist: false, permissions: [] },
  { key: "bots", name: "🤖・Bots", color: 0x64748b, hoist: false, permissions: [] },
  { key: "muted", name: "🔇・Muted", color: 0x475569, hoist: false, permissions: [] },
  { key: "gamer", name: "🎮 Gamer", color: 0x3b82f6, hoist: false, permissions: [], selfAssignable: true },
  { key: "music", name: "🎵 Muziekliefhebber", color: 0x8b5cf6, hoist: false, permissions: [], selfAssignable: true },
  { key: "creative", name: "🎨 Creatief", color: 0xec4899, hoist: false, permissions: [], selfAssignable: true },
  { key: "nightowl", name: "🌙 Nachtbraker", color: 0x6366f1, hoist: false, permissions: [], selfAssignable: true },
  { key: "movies", name: "📺 Films & Series", color: 0x14b8a6, hoist: false, permissions: [], selfAssignable: true },
  { key: "animals", name: "🐾 Dierenfan", color: 0x84cc16, hoist: false, permissions: [], selfAssignable: true },
  { key: "updates", name: "📢 Server Updates", color: 0xf59e0b, hoist: false, permissions: [], selfAssignable: true },
  { key: "gameping", name: "🎮 Game Ping", color: 0x2563eb, hoist: false, permissions: [], selfAssignable: true },
  { key: "musicping", name: "🎵 Music Ping", color: 0x7c3aed, hoist: false, permissions: [], selfAssignable: true }
];

const CATEGORY_SPECS = [
  {
    key: "start",
    name: "🌙 START HIER",
    access: "public",
    channels: [
      { key: "welcome", name: "👋・welkom", type: "text", readOnly: true, topic: "Welkom bij Luna’s Chillings 🌙" },
      { key: "rules", name: "📜・regels", type: "text", readOnly: true, topic: "Lees de regels voordat je verdergaat." },
      { key: "announcements", name: "📢・aankondigingen", type: "text", readOnly: true, topic: "Belangrijke updates van Luna en het beheer." },
      { key: "roles", name: "🎭・kies-je-rollen", type: "text", readOnly: true, topic: "Verifieer jezelf en kies interesses en meldingen." },
      { key: "info", name: "ℹ️・server-info", type: "text", readOnly: true, topic: "Uitleg over de server, rollen en kanalen." },
      { key: "faq", name: "❓・faq", type: "text", readOnly: true, topic: "Veelgestelde vragen over Luna’s Chillings." }
    ]
  },
  {
    key: "chill",
    name: "💬 DE CHILLING",
    access: "verified",
    channels: [
      { key: "general", name: "💬・algemeen", type: "text", topic: "De centrale chat van Luna’s Chillings." },
      { key: "introductions", name: "👋・voorstellen", type: "text", topic: "Stel jezelf kort voor aan de community." },
      { key: "random", name: "🎲・random", type: "text", topic: "Voor spontane gesprekken en gezellige chaos." },
      { key: "night", name: "🌙・nachtbrakers", type: "text", topic: "De late-night chat voor iedereen die nog wakker is." },
      { key: "question", name: "❔・vraag-van-de-dag", type: "text", topic: "Een vraag om nieuwe gesprekken te starten." },
      { key: "quotes", name: "💭・quotes-en-momentjes", type: "text", topic: "Grappige en legendarische servermomenten." }
    ]
  },
  {
    key: "media",
    name: "🎨 MEDIA & CREATIEF",
    access: "verified",
    channels: [
      { key: "memes", name: "😂・memes", type: "text", topic: "Memes zonder spam." },
      { key: "photos", name: "📸・fotos-en-videos", type: "text", topic: "Deel foto’s, clips en andere media." },
      { key: "musicshare", name: "🎵・muziek", type: "text", topic: "Deel nummers, playlists en artiesten." },
      { key: "creations", name: "🎨・creaties", type: "text", topic: "Eigen kunst, edits, muziek en projecten." },
      { key: "pets", name: "🐾・huisdieren", type: "text", topic: "De belangrijkste Discord-content: dierenfoto’s." }
    ]
  },
  {
    key: "gaming",
    name: "🎮 GAMING",
    access: "verified",
    channels: [
      { key: "gamingchat", name: "🎮・gaming-chat", type: "text", topic: "Algemene gesprekken over games." },
      { key: "lfg", name: "🔎・zoek-een-team", type: "text", topic: "Vind mensen om samen mee te spelen." },
      { key: "clips", name: "📹・clips-en-screenshots", type: "text", topic: "Deel wins, fails en mooie momenten." },
      { key: "gamesuggestions", name: "🕹️・game-suggesties", type: "text", topic: "Deel games voor de community." }
    ]
  },
  {
    key: "voice",
    name: "🔊 VOICE CHILLINGS",
    access: "verified",
    channels: [
      { key: "voicegeneral", name: "🔊・De Chilling", type: "voice" },
      { key: "voicenight", name: "🌙・Late Night", type: "voice" },
      { key: "voicemusic", name: "🎵・Music Lounge", type: "voice" },
      { key: "gaming1", name: "🎮・Gaming 1", type: "voice" },
      { key: "gaming2", name: "🎮・Gaming 2", type: "voice" },
      { key: "duo", name: "👥・Duo Chill", type: "voice", userLimit: 2 },
      { key: "squad", name: "👥・Squad Chill", type: "voice", userLimit: 5 },
      { key: "afk", name: "😴・AFK", type: "voice" }
    ]
  },
  {
    key: "help",
    name: "🆘 HULP & CONTACT",
    access: "public",
    channels: [
      { key: "tickets", name: "🎫・open-een-ticket", type: "text", readOnly: true, topic: "Open privé een ticket met Luna of het beheer." },
      { key: "partners", name: "🤝・partners", type: "text", readOnly: true, topic: "Gecontroleerde samenwerkingen van de server." }
    ]
  }
];

const MODERATOR_KEYS = ["luna", "admin", "headmod", "moderator"];
const SELF_ROLE_KEYS = ["gamer", "music", "creative", "nightowl", "movies", "animals", "updates", "gameping", "musicping"];
const runningSetups = new Set();

const command = new SlashCommandBuilder()
  .setName("luna-setup")
  .setDescription("Bouw Luna’s Chillings veilig op in deze server")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addBooleanOption((option) =>
    option
      .setName("bevestigen")
      .setDescription("Bevestig dat de ontbrekende kanalen en rollen mogen worden aangemaakt")
      .setRequired(true)
  );

const botPermissions = new PermissionsBitField([
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.EmbedLinks,
  PermissionFlagsBits.ReadMessageHistory,
  PermissionFlagsBits.ManageMessages,
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.ManageRoles,
  PermissionFlagsBits.ManageGuild,
  PermissionFlagsBits.KickMembers,
  PermissionFlagsBits.BanMembers,
  PermissionFlagsBits.ModerateMembers,
  PermissionFlagsBits.ManageNicknames,
  PermissionFlagsBits.ViewAuditLog,
  PermissionFlagsBits.Connect,
  PermissionFlagsBits.Speak
]);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

function inviteUrl() {
  const query = new URLSearchParams({
    client_id: client.user.id,
    permissions: botPermissions.bitfield.toString(),
    scope: "bot applications.commands"
  });
  return `https://discord.com/oauth2/authorize?${query.toString()}`;
}

async function registerCommand(guildId) {
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), {
    body: [command.toJSON()]
  });
  console.log("Slash-command /luna-setup is geregistreerd.");
}

function permissionBits(names) {
  return new PermissionsBitField(names.map((name) => PermissionFlagsBits[name]));
}

function roleSpec(key) {
  return ROLE_SPECS.find((item) => item.key === key);
}

function overwriteForCategories(guild, roles, access) {
  const everyone = {
    id: guild.roles.everyone.id,
    type: OverwriteType.Role,
    allow: access === "public" ? [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory] : [],
    deny: access === "verified" ? [PermissionFlagsBits.ViewChannel] : []
  };

  const overwrites = [everyone];

  if (access === "verified") {
    overwrites.push({
      id: roles.get("verified").id,
      type: OverwriteType.Role,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AddReactions,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak
      ]
    });
  }

  for (const key of MODERATOR_KEYS) {
    overwrites.push({
      id: roles.get(key).id,
      type: OverwriteType.Role,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AddReactions,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak,
        PermissionFlagsBits.ManageMessages
      ]
    });
  }

  overwrites.push({
    id: roles.get("muted").id,
    type: OverwriteType.Role,
    deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.Speak, PermissionFlagsBits.Stream]
  });

  overwrites.push({
    id: client.user.id,
    type: OverwriteType.Member,
    allow: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.EmbedLinks,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.Connect,
      PermissionFlagsBits.Speak
    ]
  });

  return overwrites;
}

function channelOverwrites(guild, roles, access, readOnly) {
  const overwrites = overwriteForCategories(guild, roles, access).map((item) => ({
    ...item,
    allow: item.allow ? [...item.allow] : [],
    deny: item.deny ? [...item.deny] : []
  }));

  if (!readOnly) return overwrites;

  const everyone = overwrites.find((item) => item.id === guild.roles.everyone.id);
  everyone.deny.push(
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.AddReactions,
    PermissionFlagsBits.CreatePublicThreads,
    PermissionFlagsBits.SendMessagesInThreads
  );

  return overwrites;
}

async function ensureRoles(guild) {
  await guild.roles.fetch();
  const roles = new Map();
  let created = 0;

  for (const spec of ROLE_SPECS) {
    let role = guild.roles.cache.find((candidate) => !candidate.managed && candidate.name === spec.name);
    if (!role) {
      role = await guild.roles.create({
        name: spec.name,
        color: spec.color,
        hoist: spec.hoist,
        mentionable: false,
        permissions: permissionBits(spec.permissions),
        reason: "Luna Setup Bot"
      });
      created += 1;
    }
    roles.set(spec.key, role);
  }

  return { roles, created };
}

async function ensureStructure(guild, roles) {
  await guild.channels.fetch();
  const channels = new Map();
  let categoriesCreated = 0;
  let channelsCreated = 0;

  for (const categorySpec of CATEGORY_SPECS) {
    let category = guild.channels.cache.find(
      (candidate) => candidate.type === ChannelType.GuildCategory && candidate.name === categorySpec.name
    );

    if (!category) {
      category = await guild.channels.create({
        name: categorySpec.name,
        type: ChannelType.GuildCategory,
        permissionOverwrites: overwriteForCategories(guild, roles, categorySpec.access),
        reason: "Luna Setup Bot"
      });
      categoriesCreated += 1;
    }

    for (const channelSpec of categorySpec.channels) {
      const discordType = channelSpec.type === "voice" ? ChannelType.GuildVoice : ChannelType.GuildText;
      let channel = guild.channels.cache.find(
        (candidate) => candidate.type === discordType && candidate.name === channelSpec.name && candidate.parentId === category.id
      );

      if (!channel) {
        const options = {
          name: channelSpec.name,
          type: discordType,
          parent: category.id,
          permissionOverwrites: channelOverwrites(guild, roles, categorySpec.access, Boolean(channelSpec.readOnly)),
          reason: "Luna Setup Bot"
        };
        if (channelSpec.topic) options.topic = channelSpec.topic;
        if (channelSpec.userLimit) options.userLimit = channelSpec.userLimit;
        channel = await guild.channels.create(options);
        channelsCreated += 1;
      }

      channels.set(channelSpec.key, channel);
    }
  }

  return { channels, categoriesCreated, channelsCreated };
}

function markedEmbed(title, description, color = 0x8b5cf6) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: MARKER });
}

async function ensureBotPost(channel, postKey, payload) {
  if (!channel || channel.type !== ChannelType.GuildText) return;
  const marker = `${MARKER}:${postKey}`;

  let exists = false;
  try {
    const messages = await channel.messages.fetch({ limit: 50 });
    exists = messages.some(
      (message) =>
        message.author.id === client.user.id &&
        message.embeds.some((embed) => embed.footer && embed.footer.text === marker)
    );
  } catch (error) {
    console.warn(`Kon recente berichten in ${channel.name} niet controleren: ${error.message}`);
  }

  if (exists) return;

  const embeds = (payload.embeds || []).map((embed) => EmbedBuilder.from(embed).setFooter({ text: marker }));
  await channel.send({ ...payload, embeds });
}

function roleButtons() {
  const rows = [];
  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("luna:verify")
        .setLabel("Verifieer mij")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Success)
    )
  );

  const selfRoles = SELF_ROLE_KEYS.map((key) => roleSpec(key));
  for (let index = 0; index < selfRoles.length; index += 5) {
    rows.push(
      new ActionRowBuilder().addComponents(
        selfRoles.slice(index, index + 5).map((role) =>
          new ButtonBuilder()
            .setCustomId(`luna:role:${role.key}`)
            .setLabel(role.name.replace(/^\S+\s*/, "").slice(0, 80))
            .setStyle(ButtonStyle.Secondary)
        )
      )
    );
  }

  return rows;
}

async function publishStarterMessages(channels) {
  await ensureBotPost(channels.get("welcome"), "welcome", {
    embeds: [
      markedEmbed(
        "Welkom bij Luna’s Chillings 🌙",
        "Pak iets te drinken, plof neer en voel je thuis. Lees eerst de regels, verifieer jezelf in **🎭・kies-je-rollen** en kom daarna gezellig praten, gamen en muziek delen.\n\n*Chillen onder dezelfde maan.*"
      )
    ]
  });

  await ensureBotPost(channels.get("rules"), "rules", {
    embeds: [
      markedEmbed(
        "📜 Regels van Luna’s Chillings",
        [
          "**1. Respecteer elkaar.** Geen pesten, discriminatie, intimidatie of persoonlijke aanvallen.",
          "**2. Houd het gezellig.** Discussies mogen, onnodig drama en ruzie niet.",
          "**3. Geen spam of reclame.** Niet flooden, massaal taggen of ongevraagd promoten.",
          "**4. Geen NSFW of illegale content.** Houd de hele server veilig en geschikt.",
          "**5. Bescherm privacy.** Deel geen privégegevens of gesprekken zonder toestemming.",
          "**6. Gebruik het juiste kanaal.** Volg aanwijzingen van Luna en de moderators.",
          "**7. Geen impersonatie.** Doe je niet voor als een ander lid of beheerder.",
          "**8. Voice blijft rustig.** Geen oorverdovend geluid, spam of opnemen zonder toestemming.",
          "**9. Omzeil geen maatregelen.** Time-outs, filters en bans zijn niet te omzeilen.",
          "**10. Volg de Discord-regels.** De voorwaarden en richtlijnen van Discord gelden altijd."
        ].join("\n\n"),
        0xec4899
      )
    ]
  });

  await ensureBotPost(channels.get("roles"), "roles", {
    embeds: [
      markedEmbed(
        "🎭 Kies jouw rollen",
        "Klik eerst op **Verifieer mij** om de communitykanalen te openen. Daarna kun je interesse- en meldingsrollen aan- of uitzetten met de andere knoppen."
      )
    ],
    components: roleButtons()
  });

  await ensureBotPost(channels.get("info"), "info", {
    embeds: [
      markedEmbed(
        "ℹ️ Server-info",
        "**Luna’s Chillings** is een Nederlandse chillserver voor gesprekken, gaming, muziek en creativiteit.\n\n• Start in **💬・algemeen**\n• Zoek medespelers in **🔎・zoek-een-team**\n• Deel muziek in **🎵・muziek**\n• Gebruik **🎫・open-een-ticket** voor privécontact"
      )
    ]
  });

  await ensureBotPost(channels.get("faq"), "faq", {
    embeds: [
      markedEmbed(
        "❓ Veelgestelde vragen",
        "**Ik zie de gewone kanalen niet.**\nKlik op *Verifieer mij* in **🎭・kies-je-rollen**.\n\n**Hoe verander ik mijn rollen?**\nKlik opnieuw op de bijbehorende knop.\n\n**Hoe neem ik privé contact op?**\nOpen een ticket in **🎫・open-een-ticket**."
      )
    ]
  });

  await ensureBotPost(channels.get("introductions"), "introductions", {
    embeds: [
      markedEmbed(
        "👋 Stel jezelf voor",
        "**Naam of bijnaam:**\n**Hobby’s:**\n**Favoriete game, artiest of serie:**\n**Waarvoor ben je hier?:**\n**Een random feitje:**\n\nDeel nooit je adres, school, telefoonnummer of andere gevoelige gegevens."
      )
    ]
  });

  await ensureBotPost(channels.get("tickets"), "tickets", {
    embeds: [
      markedEmbed(
        "🎫 Privé contact",
        "Heb je een vraag, probleem of melding? Klik hieronder. De bot maakt een privé-kanaal dat alleen jij, Luna en de moderators kunnen zien."
      )
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("luna:ticket")
          .setLabel("Open een ticket")
          .setEmoji("🎫")
          .setStyle(ButtonStyle.Primary)
      )
    ]
  });
}

async function runSetup(interaction) {
  const guild = interaction.guild;
  if (runningSetups.has(guild.id)) {
    await interaction.editReply("Er draait al een setup in deze server. Wacht even tot die klaar is.");
    return;
  }

  runningSetups.add(guild.id);
  try {
    if (guild.name !== SERVER_NAME) {
      await guild.setName(SERVER_NAME, "Luna Setup Bot");
    }

    const roleResult = await ensureRoles(guild);
    const structureResult = await ensureStructure(guild, roleResult.roles);

    const lunaMember = await guild.members.fetch(interaction.user.id);
    const lunaRole = roleResult.roles.get("luna");
    if (lunaRole && !lunaMember.roles.cache.has(lunaRole.id)) {
      await lunaMember.roles.add(lunaRole, "Luna Setup Bot").catch((error) => {
        console.warn(`Kon de Luna-rol niet toekennen: ${error.message}`);
      });
    }

    const afkChannel = structureResult.channels.get("afk");
    if (afkChannel) {
      await guild.setAFKChannel(afkChannel, "Luna Setup Bot").catch(() => {});
      await guild.setAFKTimeout(300, "Luna Setup Bot").catch(() => {});
    }

    await publishStarterMessages(structureResult.channels);

    await interaction.editReply(
      [
        "✅ **Luna’s Chillings is klaar.**",
        `Nieuwe rollen: **${roleResult.created}**`,
        `Nieuwe categorieën: **${structureResult.categoriesCreated}**`,
        `Nieuwe kanalen: **${structureResult.channelsCreated}**`,
        "Bestaande onderdelen zijn niet verwijderd of overschreven."
      ].join("\n")
    );
  } finally {
    runningSetups.delete(guild.id);
  }
}

async function handleRoleButton(interaction, key) {
  const spec = roleSpec(key);
  if (!spec || !spec.selfAssignable) {
    await interaction.reply({ content: "Deze rol kan niet via dit paneel worden gekozen.", flags: MessageFlags.Ephemeral });
    return;
  }

  const role = interaction.guild.roles.cache.find((candidate) => candidate.name === spec.name);
  if (!role) {
    await interaction.reply({ content: "Deze rol bestaat nog niet. Laat Luna eerst `/luna-setup` uitvoeren.", flags: MessageFlags.Ephemeral });
    return;
  }

  const member = await interaction.guild.members.fetch(interaction.user.id);
  if (member.roles.cache.has(role.id)) {
    await member.roles.remove(role, "Zelfrol uitgeschakeld");
    await interaction.reply({ content: `➖ Rol verwijderd: **${role.name}**`, flags: MessageFlags.Ephemeral });
  } else {
    await member.roles.add(role, "Zelfrol ingeschakeld");
    await interaction.reply({ content: `➕ Rol toegevoegd: **${role.name}**`, flags: MessageFlags.Ephemeral });
  }
}

async function handleVerify(interaction) {
  const verifiedSpec = roleSpec("verified");
  const newcomerSpec = roleSpec("newcomer");
  const verified = interaction.guild.roles.cache.find((role) => role.name === verifiedSpec.name);
  const newcomer = interaction.guild.roles.cache.find((role) => role.name === newcomerSpec.name);

  if (!verified) {
    await interaction.reply({ content: "De verificatierol ontbreekt. Laat Luna eerst `/luna-setup` uitvoeren.", flags: MessageFlags.Ephemeral });
    return;
  }

  const member = await interaction.guild.members.fetch(interaction.user.id);
  await member.roles.add(verified, "Verificatie via Luna Setup Bot");
  if (newcomer && member.roles.cache.has(newcomer.id)) {
    await member.roles.remove(newcomer, "Verificatie afgerond").catch(() => {});
  }

  await interaction.reply({ content: "✅ Je bent geverifieerd. De communitykanalen zijn nu zichtbaar.", flags: MessageFlags.Ephemeral });
}

async function handleTicket(interaction) {
  const guild = interaction.guild;
  const existing = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildText && channel.topic === `luna-ticket-owner:${interaction.user.id}`
  );

  if (existing) {
    await interaction.reply({ content: `Je hebt al een open ticket: ${existing}`, flags: MessageFlags.Ephemeral });
    return;
  }

  const ticketPanel = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildText && channel.name === "🎫・open-een-ticket"
  );
  if (!ticketPanel || !ticketPanel.parent) {
    await interaction.reply({ content: "Het ticketgedeelte ontbreekt. Laat Luna eerst `/luna-setup` uitvoeren.", flags: MessageFlags.Ephemeral });
    return;
  }

  const overwrites = [
    {
      id: guild.roles.everyone.id,
      type: OverwriteType.Role,
      deny: [PermissionFlagsBits.ViewChannel]
    },
    {
      id: interaction.user.id,
      type: OverwriteType.Member,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages]
    },
    {
      id: client.user.id,
      type: OverwriteType.Member,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
    }
  ];

  for (const key of MODERATOR_KEYS) {
    const spec = roleSpec(key);
    const role = guild.roles.cache.find((candidate) => candidate.name === spec.name);
    if (role) {
      overwrites.push({
        id: role.id,
        type: OverwriteType.Role,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages]
      });
    }
  }

  const safeName = interaction.user.username.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").slice(0, 40) || "gebruiker";
  const ticket = await guild.channels.create({
    name: `🎫・ticket-${safeName}`,
    type: ChannelType.GuildText,
    parent: ticketPanel.parentId,
    topic: `luna-ticket-owner:${interaction.user.id}`,
    permissionOverwrites: overwrites,
    reason: `Ticket geopend door ${interaction.user.username}`
  });

  await ticket.send({
    content: `${interaction.user}`,
    embeds: [
      markedEmbed(
        "🎫 Ticket geopend",
        "Leg rustig uit waarmee we kunnen helpen. Deel alleen informatie die nodig is en plaats nooit wachtwoorden, codes of andere geheimen."
      ).setFooter({ text: `${MARKER}:ticket` })
    ]
  });

  await interaction.reply({ content: `✅ Je privé-ticket is geopend: ${ticket}`, flags: MessageFlags.Ephemeral });
}

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ingelogd als ${readyClient.user.tag}`);
  console.log(`Uitnodigingslink: ${inviteUrl()}`);

  for (const guild of readyClient.guilds.cache.values()) {
    await registerCommand(guild.id).catch((error) => {
      console.error(`Registreren van /luna-setup in ${guild.name} mislukte:`, error);
    });
  }

  if (readyClient.guilds.cache.size > 0) {
    console.log("Gebruik daarna: /luna-setup bevestigen:Ja");
  } else {
    console.log("Voeg de bot toe met de link hierboven. Het commando wordt daarna automatisch geregistreerd.");
  }
});

client.on(Events.GuildCreate, async (guild) => {
  await registerCommand(guild.id).catch((error) => {
    console.error("Registreren van /luna-setup na uitnodigen mislukte:", error);
  });
  console.log("Gebruik nu: /luna-setup bevestigen:Ja");
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand() && interaction.commandName === "luna-setup") {
      if (!interaction.inGuild()) return;

      const allowed = interaction.user.id === interaction.guild.ownerId || interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
      if (!allowed) {
        await interaction.reply({ content: "Alleen de servereigenaar of een administrator kan deze setup starten.", flags: MessageFlags.Ephemeral });
        return;
      }

      if (!interaction.options.getBoolean("bevestigen", true)) {
        await interaction.reply({ content: "Setup geannuleerd. Kies `Ja` bij bevestigen om te starten.", flags: MessageFlags.Ephemeral });
        return;
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      await runSetup(interaction);
      return;
    }

    if (!interaction.isButton() || !interaction.inGuild()) return;
    if (interaction.customId === "luna:verify") {
      await handleVerify(interaction);
    } else if (interaction.customId === "luna:ticket") {
      await handleTicket(interaction);
    } else if (interaction.customId.startsWith("luna:role:")) {
      await handleRoleButton(interaction, interaction.customId.split(":")[2]);
    }
  } catch (error) {
    console.error(error);
    const message = "Er ging iets mis. Controleer in Railway of de bot voldoende rechten heeft en bekijk de logs.";
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(message).catch(() => {});
    } else {
      await interaction.reply({ content: message, flags: MessageFlags.Ephemeral }).catch(() => {});
    }
  }
});

async function start() {
  await client.login(TOKEN);
}

start().catch((error) => {
  console.error("De bot kon niet starten:", error);
  process.exit(1);
});
