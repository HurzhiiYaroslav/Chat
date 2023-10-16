

// Ignore Spelling: Json

using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Text.Json.Nodes;
using webapi.Entities;

namespace webapi.Utilities
{
    public static class JSONConvertor
    {
        public static string ConvertChatDataToJson(User user, ApplicationContext db)
        {
            try
            {
                var userData = new
                {
                    user.Name,
                    user.Photo
                };

                var chatData = new
                {
                    user = userData,
                    chats = GetUserChatsJson(user, db)
                };

                return JsonConvert.SerializeObject(chatData);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return null;
            }
        }

        public static string ConvertUserSearchToJson(User user, string userInput, ApplicationContext db)
        {
            try
            {
                var foundUsers = db.Clients
                    .Where(u => u.Name.Contains(userInput) && u != user)
                    .ToList();

                foundUsers.RemoveAll(u => GetCompanions(db,user).Contains(u));

                var foundChannels = db.Channels
                    .Include(c=>c.Users)
                    .Include(c => c.Enrollments)
                    .Include(c => c.Messages)
                   .Where(c => c.Title.Contains(userInput))
                   .Where(c => c.IsPublic)
                   .ToList();

                foundChannels.RemoveAll(c => user.Channels.ToList().Contains(c));

                var result = new
                {
                    Users = foundUsers.Select(u => UserToJsonObject(u)).ToList(),
                    Channels = foundChannels.Select(c => ChannelToJsonObject(c)).ToList()
                };

                return JsonConvert.SerializeObject(result);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return null;
            }
        }

        private static IEnumerable<User> GetCompanions(ApplicationContext db, User user)
        {
            var dialogs = db.Dialogs
                .Where(d => d.User1 == user || d.User2 == user)
                .ToList();

            var companions = dialogs
                .Select(d => d.User1 == user ? d.User2 : d.User1)
                .ToList();

            return companions;
        }

        private static IEnumerable<object> GetUserChatsJson(User user, ApplicationContext db)
        {
            var chats = db.GetChatsForUser(user);
            var chatDataList = new List<object>();

            foreach (var chat in chats)
            {
                if (chat is Dialog dialog)
                {
                    chatDataList.Add(DialogToJsonObject(dialog, user));
                }
                else if (chat is Channel channel)
                {
                    chatDataList.Add(ChannelToJsonObject(channel));
                }
                else if (chat is Group group)
                {
                    chatDataList.Add(GroupToJsonObject(group));
                }
                
            }

            return chatDataList;
        }

        public static JObject GroupToJsonObject(Group group)
        {
            var jsonObject = new JObject
            {
                { "Id", group.Id },
                { "Type", "Group" },
                { "Title", group.Title },
                { "Description", group.Description },
                { "Logo", group.Logo },
                { "Users", JArray.FromObject(group.Enrollments.Select(EnrollmentToJsonObject)) },
                { "Messages", JArray.FromObject(group.Messages.OrderByDescending(m => m.Timestamp).Reverse().Select(MessageToJsonObject)) },
            };
            LastSeenMessege(group.Messages, jsonObject);
            return jsonObject;
        }

        public static JObject DialogToJsonObject(Dialog dialog, User user)
        {
            var jsonObject = new JObject
            { 
                { "Id", dialog.Id },
                { "Type", "Dialog" },
                { "Companion", dialog.CompaionInfo(user) },
                { "Messages", JArray.FromObject(dialog.Messages.OrderByDescending(m => m.Timestamp).Reverse().Select(MessageToJsonObject)) },
            };
            LastSeenMessege(dialog.Messages, jsonObject);
            return jsonObject;
        }

        private static JObject LastSeenMessege(List<Message> messages,JObject obj) {
            var lastSeenMessage = messages
               .Where(m => m.IsSeen)
               .OrderByDescending(m => m.Timestamp)
               .FirstOrDefault();
            if (lastSeenMessage is null) return null;
            obj.Add("LastSeenMessage", MessageToJsonObject(lastSeenMessage));
            return obj;
        }

        public static JObject ChannelToJsonObject(Channel channel)
        {
            var jsonObject = new JObject
        {
            { "Id", channel.Id },
            { "Type", "Channel" },
            { "Title", channel.Title },
            {"isPublic",channel.IsPublic },
            { "Description", channel.Description },
            { "Logo", channel.Logo },
            { "Users", JArray.FromObject(channel.Enrollments.Select(EnrollmentToJsonObject)) },
            { "Messages", JArray.FromObject(channel.Messages.OrderByDescending(m => m.Timestamp).Reverse().Select(MessageToJsonObject)) }
        };

            return jsonObject;
        }

        public static JObject EnrollmentToJsonObject(Enrollment enrollment)
        {
            var jsonObject = new JObject
        {
            { "Id", enrollment.User.Id },
            { "Name", enrollment.User.Name },
            { "Photo", enrollment.User.Photo },
            { "Role", enrollment.Role.ToString()}
        };

            return jsonObject;
        }


        public static JObject UserToJsonObject(User user)
        {
            var jsonObject = new JObject
        {
            { "Id", user.Id },
            { "Name", user.Name },
            { "Photo", user.Photo }
        };

            return jsonObject;
        }

        public static JObject MessageToJsonObject(Message message)
        {
            var jsonObject = new JObject
        {
            { "Id", message.Id },
            { "sender", message.Sender.Id },
            { "content", message.Content },
            { "time", message.Timestamp.ToString("yyyy-MM-ddTHH:mm:ss") },
            { "Files", JArray.FromObject(message.Files?.Select(FileToJsonObject)) }
        };

            return jsonObject;
        }

        public static JObject FileToJsonObject(FileEntity file)
        {
            var jsonObject = new JObject
        {
            { "Id", file.Id },
            { "Name", file.Name },
            { "Type", file.Type },
            { "Path", file.Path }
        };

            return jsonObject;
        }

    }
}
