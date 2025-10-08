using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Reezer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SongFieldsAdjust : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Raw", table: "Songs");

            migrationBuilder.AddColumn<string>(
                name: "RawPath",
                table: "Songs",
                type: "text",
                nullable: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "RawPath", table: "Songs");

            migrationBuilder.AddColumn<bool>(
                name: "Raw",
                table: "Songs",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );
        }
    }
}
