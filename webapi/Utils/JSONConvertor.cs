
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using webapi.Entities;

namespace webapi.Utils
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
                var foundUsers = db.Users
                    .Where(u => u.Name.Contains(userInput) && u != user)
                    .Except(GetCompanions(db, user))
                    .ToList();

                var result = new
                {
                    Users = foundUsers.Select(u => UserToJsonObject(u)).ToList()
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
            { "CreatorId", group.Creator.Id },
            { "Users", JArray.FromObject(group.Users.Select(UserToJsonObject)) },
            { "Messages", JArray.FromObject(group.Messages.Select(MessageToJsonObject)) }
        };

            return jsonObject;
        }

        public static JObject DialogToJsonObject(Dialog dialog, User user)
        {
            var jsonObject = new JObject
        {
            { "Id", dialog.Id },
            { "Type", "Dialog" },
            { "Companion", dialog.CompaionInfo(user) },
            { "Messages", JArray.FromObject(dialog.Messages.Select(MessageToJsonObject)) }
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
            { "time", message.Timestamp },
            { "Files", JArray.FromObject(message.Files.Select(FileToJsonObject)) }
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
