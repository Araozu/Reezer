using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Reezer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AlbumCover : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CoverPath",
                table: "Albums",
                type: "text",
                nullable: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "CoverPath", table: "Albums");
        }
    }
}
