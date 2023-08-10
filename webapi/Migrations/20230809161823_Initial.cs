using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace webapi.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("30dc3275-6d2a-42b1-b0b3-0efb9845c8e4"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("3e1e589d-47e4-479b-b688-0e4d4def01e3"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("95f9958a-82f3-4f69-8772-6db3e5864e8d"));

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "Messages",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Login", "Name", "Password", "Photo" },
                values: new object[,]
                {
                    { new Guid("89896e5b-cdcb-4df8-b0ca-70bce10ed01b"), "User3", "Samuel", "$2a$11$m27qBODQglA1Nj9nlOKCF.92k.QNkwaXaoLUUWu9Eth/VPnIW/Bry", "default.jpg" },
                    { new Guid("c0912cfe-376b-47b6-8f78-3f07f672d676"), "User1", "Tom", "$2a$11$/biIAGWI6wX4..KawpZtD.GAgUKjqauWSL6P9p/p8S2Igs9EZBaK.", "default.jpg" },
                    { new Guid("e2e44036-ed46-4c4c-95b0-97ce448467a3"), "User2", "Bob", "$2a$11$jk8pYp4/s3SNxZADnEgzK.Ue.ziKGIS/3bVnzJyvXWUD855mmKX6O", "default.jpg" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("89896e5b-cdcb-4df8-b0ca-70bce10ed01b"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("c0912cfe-376b-47b6-8f78-3f07f672d676"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("e2e44036-ed46-4c4c-95b0-97ce448467a3"));

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "Messages",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Login", "Name", "Password", "Photo" },
                values: new object[,]
                {
                    { new Guid("30dc3275-6d2a-42b1-b0b3-0efb9845c8e4"), "User1", "Tom", "$2a$11$NtT.hUuuv55AjcvhOA7u5.zFjlgQkKbAV1kw/SNybtDgWyINMGpv2", "default.jpg" },
                    { new Guid("3e1e589d-47e4-479b-b688-0e4d4def01e3"), "User3", "Samuel", "$2a$11$cepWO9FvNBgLdOx.ktbxT.8Sa/FFuyM0ruovFg1Lp9Gf3Q75EgeYq", "default.jpg" },
                    { new Guid("95f9958a-82f3-4f69-8772-6db3e5864e8d"), "User2", "Bob", "$2a$11$HWOAjX3LCm3kUil2BP2sdeTAMLrLPG7aCGj4f3xLyWkRcAfXJ0.Gy", "default.jpg" }
                });
        }
    }
}
