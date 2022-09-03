const { PermissionFlagsBits } = require('discord.js');

module.exports = [
  // PermissionFlagsBits.AddReactions,
  // PermissionFlagsBits.Connect,
  PermissionFlagsBits.EmbedLinks,
  PermissionFlagsBits.ManageMessages, // For message pinning
  PermissionFlagsBits.ReadMessageHistory, // Possibly mandatory?
  PermissionFlagsBits.SendMessages, // Mandatory
  PermissionFlagsBits.SendMessagesInThreads, // Mandatory
  PermissionFlagsBits.UseExternalEmojis, // For custom dice emojis
  PermissionFlagsBits.ViewChannel, // Mandatory
];
