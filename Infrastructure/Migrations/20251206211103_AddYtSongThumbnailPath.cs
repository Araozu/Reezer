using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Reezer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddYtSongThumbnailPath : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ThumbnailPath",
                table: "YtSongs",
                type: "text",
                nullable: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "ThumbnailPath", table: "YtSongs");
        }
    }
}
