using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Reezer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SongNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TrackNumber",
                table: "Songs",
                type: "integer",
                nullable: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "TrackNumber", table: "Songs");
        }
    }
}
